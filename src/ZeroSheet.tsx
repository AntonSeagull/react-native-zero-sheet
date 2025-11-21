import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Keyboard,
  type NativeEventSubscription,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ZeroSheetBox from './ZeroSheetBox';
import ZeroSheetContent from './ZeroSheetContent';
import ZeroSheetFooter from './ZeroSheetFooter';
import ZeroSheetHeader from './ZeroSheetHeader';

const winHeight = Dimensions.get('window').height;

type CustomStyles = {
  wrapper?: ViewStyle;
  container?: ViewStyle;
  draggableIcon?: ViewStyle;
};

interface ZeroSheetProps {

  draggable?: boolean; // Возможность перетаскивания



  onChange?: (open: boolean) => void;

  backdrop?: boolean; //Показывать фон
  closeByBackdropClick?: boolean; //Закрытие по клику на фон
  before?: React.ReactNode; // Элемент перед контентом

  backgroundColor?: string;
  visible?: boolean;
  customStyles?: CustomStyles;


  noBottomInset?: boolean; // Не добавлять нижний отступ
  noTopInset?: boolean; // Не добавлять верхний отступ

  footer?: React.ReactNode;
  header?: React.ReactNode;

  fixedFooterHeight?: number;
  fixedHeaderHeight?: number;
  fixedContentHeight?: number;


  onSheetOpen?: () => void;
  onSheetClose?: () => void;
  onSheetOpened?: () => void;
  onSheetClosed?: () => void;
  onManualClose?: () => void;


  renderBackground?: React.ReactNode;


  buttonColor?: string;



  children?: React.ReactNode;

  draggableHeight?: number; //Default 25
}

export interface ZeroSheetHandle {
  open: () => void;
  close: () => void;
  expand: () => void;
}


const SWIPE_CLOSE_THRESHOLD = 100;


const openDuration = 300;
const closeDuration = 200;


type ZeroSheetRegistry = {

  footerContentHeight: number;
  headerContentHeight: number;
  contentContentHeight: number;
  keyboardContentHeight: number;
  setFooterContentHeight: (height: number) => void;
  setHeaderContentHeight: (height: number) => void;
  setContentContentHeight: (height: number) => void;
  setKeyboardContentHeight: (height: number) => void;
  fixedFooterHeight?: number;
  fixedHeaderHeight?: number;
  fixedContentHeight?: number;
  draggableHeight: number;
  topInsets: number;
  buttonInsets: number;
};
const ZeroSheetContext = createContext<ZeroSheetRegistry | null>(null);



export const useZeroSheetContext = () => {
  const ctx = useContext(ZeroSheetContext);
  if (!ctx) throw new Error('useZeroSheetContext must be used within <ZeroSheet>');
  return ctx;
};


const ZeroSheet = forwardRef<ZeroSheetHandle, ZeroSheetProps>((props, ref) => {

  const {

    fixedFooterHeight,
    fixedHeaderHeight,
    fixedContentHeight,

    draggableHeight = 25,

    draggable = true,
    footer,
    before,

    header,
    closeByBackdropClick = true,
    backgroundColor = '#fff',
    backdrop = true,
    renderBackground,
    customStyles = {},
    onSheetOpen,
    onChange,
    onManualClose,
    buttonColor,
    onSheetClose,
    onSheetOpened,
    onSheetClosed,
    children = <View />
  } = props;

  const insets = useSafeAreaInsets();




  const buttonInsets = props.noBottomInset ? 0 : insets.bottom;
  const topInsets = props.noTopInset ? 0 : insets.top;

  const [modalVisible, setModalVisible] = useState(false);


  const translateY = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    open: () => handleSetVisible(true),
    close: () => handleSetVisible(false),
    expand: () => handleSetVisible(true)
  }));

  const backHandlerRef = useRef<NativeEventSubscription | null>(null);

  useEffect(() => {

    if (modalVisible) {

      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
        backHandlerRef.current = null;
      }

      //Делаем перехват события кнопки назад на андроиде
      backHandlerRef.current = BackHandler.addEventListener('hardwareBackPress', () => {
        if (modalVisible) {
          onManualClose?.();
          handleSetVisible(false);
          return true;
        }
        return false;
      });


      onSheetOpen?.();
      Keyboard.dismiss();

      Animated.parallel([

        Animated.timing(translateY, {
          toValue: 0,
          duration: openDuration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {
        onSheetOpened?.();
        onChange?.(true);
      });

    } else {

      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
        backHandlerRef.current = null;
      }


      onSheetClosed?.();
      onChange?.(false);
    }


  }, [modalVisible])

  const handleSetVisible = useCallback((visible: boolean) => {
    if (visible) {

      setModalVisible(true);

    } else {
      onSheetClose?.();

      Animated.parallel([

        Animated.timing(translateY, {
          toValue: winHeight,
          duration: closeDuration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start(() => {

        setModalVisible(false);

      });
    }
  }, [onSheetClose, translateY]);

  useEffect(() => {
    if (props.visible !== undefined) {
      handleSetVisible(props.visible);
    }
  }, [props.visible, handleSetVisible]);


  const delayUpdateKeyboardHeight = useRef<any | null>(null);

  useEffect(() => {
    if (Platform.OS == 'android') return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        clearTimeout(delayUpdateKeyboardHeight.current!);
        const keyboardHeight = e.endCoordinates.height;
        delayUpdateKeyboardHeight.current = setTimeout(() => {
          setKeyboardContentHeight(keyboardHeight - buttonInsets);
        }, 200);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        clearTimeout(delayUpdateKeyboardHeight.current!);
        setKeyboardContentHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [buttonInsets]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dy) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }

        },
        onPanResponderRelease: (_, gestureState) => {

          if (gestureState.dy > SWIPE_CLOSE_THRESHOLD) {

            onManualClose?.();

            handleSetVisible(false);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false
            }).start();
          }

        }
      }),
    [onManualClose, translateY, handleSetVisible]
  );



  const onCloseByBackdropClick = () => {
    if (closeByBackdropClick) {

      onManualClose?.();
      handleSetVisible(false);
    }
  };


  const backdropOpacity = translateY.interpolate({
    inputRange: [0, winHeight],
    outputRange: [1, 0],
    extrapolate: 'clamp'

  });


  const [footerContentHeight, setFooterContentHeight] = useState(0);
  const [headerContentHeight, setHeaderContentHeight] = useState(0);
  const [contentContentHeight, setContentContentHeight] = useState(0);
  const [keyboardContentHeight, setKeyboardContentHeight] = useState(0);


  if (!modalVisible) return null;

  return (
    <ZeroSheetContext.Provider value={{
      footerContentHeight,
      headerContentHeight,
      contentContentHeight,
      keyboardContentHeight,
      setFooterContentHeight,
      setHeaderContentHeight,
      setContentContentHeight,
      setKeyboardContentHeight,
      fixedFooterHeight,
      fixedHeaderHeight,
      fixedContentHeight,
      draggableHeight,
      topInsets,
      buttonInsets
    }}>
      <View
        pointerEvents={!backdrop ? 'box-none' : 'auto'}
        style={{
          zIndex: 9999,
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0
        }}
      >
        {/*    <View
          style={{
            position: 'absolute',
            top: 50,
            left: 10,
            zIndex: 9999,
            backgroundColor: 'gray',
          }}
        >
          <Text>Keyboard Content Height: {keyboardContentHeight}</Text>
          <Text>Header Content Height: {headerContentHeight}</Text>
          <Text>Footer Content Height: {footerContentHeight}</Text>
          <Text>Content Content Height: {contentContentHeight}</Text>
          <Text>Total Content Height: {keyboardContentHeight + headerContentHeight + footerContentHeight + contentContentHeight}</Text>
          <Text>Screen Height: {Dimensions.get('window').height}</Text>


        </View>*/}
        <View
          pointerEvents={!backdrop ? 'box-none' : 'auto'}
          style={[
            styles.wrapper,
            customStyles.wrapper,
          ]}
        >

          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              justifyContent: 'flex-end',
              opacity: backdropOpacity,
              backgroundColor: backdrop ? '#00000077' : 'transparent'
            }}
          ></Animated.View>


          {backdrop ? (
            <TouchableOpacity
              style={styles.mask}
              activeOpacity={1}
              onPress={onCloseByBackdropClick}
            />
          ) : (
            <View pointerEvents="none" style={styles.mask}></View>
          )}


          {!!before && before}
          <Animated.View
            style={[
              styles.container,

              customStyles.container,
              {
                borderTopEndRadius: 20,
                borderTopStartRadius: 20,

                backgroundColor: renderBackground ? 'transparent' : backgroundColor,
                transform: [{ translateY }] // 👈 добавляем трансформацию
              }
            ]}
          >
            {renderBackground}

            {draggable && <View
              {...panResponder.panHandlers}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                height: draggableHeight
              }}
            >
              <View
                style={[styles.draggableIcon, customStyles.draggableIcon]}
              />
            </View>}


            <View
              {...(draggable ? panResponder.panHandlers : {})}

            >
              <ZeroSheetHeader>
                {header}
              </ZeroSheetHeader>


            </View>


            <ZeroSheetContent
            >
              {children}
            </ZeroSheetContent>


            {!!footer && (

              <ZeroSheetFooter>
                {footer}
              </ZeroSheetFooter>
            )}


            <ZeroSheetBox
              closeDuration={300}
              openDuration={300}
              height={keyboardContentHeight}
              visible={!!keyboardContentHeight}
            />

            <View
              style={{
                backgroundColor: buttonColor || backgroundColor,

                height: buttonInsets,
              }}
            ></View>

          </Animated.View>


        </View>
      </View >


    </ZeroSheetContext.Provider>
  );
});
const styles = StyleSheet.create({
  wrapper: {

    flex: 1
  },
  mask: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  container: {
    width: '100%',

    overflow: 'hidden'
  },
  draggableContainer: {
    width: '100%'
  },
  draggableIcon: {
    width: 34,
    height: 5,
    borderRadius: 24,
    margin: 10,
    backgroundColor: 'gray'
  }
});

export default ZeroSheet;
