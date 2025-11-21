import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  Animated,
  Dimensions,
  type LayoutChangeEvent,
  ScrollView,
  View,
} from 'react-native';

import { useZeroSheetContext } from './ZeroSheet';

const { height } = Dimensions.get('window');
interface ZeroSheetContentProps {
    children: React.ReactNode;
    duration?: number;
}

const ZeroSheetContent: React.FC<ZeroSheetContentProps> = ({
    children,
    duration = 300,
}) => {

    const { headerContentHeight, topInsets, buttonInsets, keyboardContentHeight, footerContentHeight, contentContentHeight, setContentContentHeight, draggableHeight, fixedContentHeight } = useZeroSheetContext();

    const animatedHeight = useRef(new Animated.Value(0)).current;

    const lastLayoutHeight = useRef(0);


    const limitHeight = useCallback((_height: number) => {

        let maxHeight = height;
        maxHeight = maxHeight - headerContentHeight - footerContentHeight - keyboardContentHeight - draggableHeight - topInsets - buttonInsets;


        if (_height > maxHeight) {
            return maxHeight;
        }

        return _height;
    }, [headerContentHeight, footerContentHeight, keyboardContentHeight, draggableHeight, topInsets, buttonInsets]);

    const resizeContent = useCallback(() => {
        let newHeight = lastLayoutHeight.current;

        if (fixedContentHeight) {

            if (contentContentHeight !== fixedContentHeight) {
                setContentContentHeight(fixedContentHeight);
            }



            return;
        }

        newHeight = limitHeight(newHeight);


        if (newHeight !== contentContentHeight) {
            setContentContentHeight(newHeight);
        }
    }, [fixedContentHeight, contentContentHeight, setContentContentHeight, limitHeight]);

    const onLayout = useCallback((e: LayoutChangeEvent) => {

        let newHeight = Math.round(e.nativeEvent.layout.height);
        lastLayoutHeight.current = newHeight;

        resizeContent();
    }, [resizeContent]);

    useEffect(() => {
        resizeContent();
    }, [resizeContent]);


    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: contentContentHeight,
            duration,
            useNativeDriver: false, // nativeDriver не поддерживает height
        }).start(() => {

        })
    }, [contentContentHeight, duration, animatedHeight]);


    useEffect(() => {
        if (fixedContentHeight) {
            if (contentContentHeight !== fixedContentHeight) {
                setContentContentHeight(fixedContentHeight);
            }
        }
    }, [fixedContentHeight, contentContentHeight, setContentContentHeight]);




    return (
        <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
            <ScrollView
                scrollEnabled={true}
                keyboardShouldPersistTaps="always"
                overScrollMode="always"
                showsVerticalScrollIndicator={false}
            >
                <View onLayout={onLayout}>
                    {children}
                </View>
            </ScrollView>
        </Animated.View>
    );
};

export default ZeroSheetContent;