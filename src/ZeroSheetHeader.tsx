import {
  useEffect,
  useRef,
} from 'react';

import {
  Animated,
  type LayoutChangeEvent,
  ScrollView,
  View,
} from 'react-native';

import { useZeroSheetContext } from './ZeroSheet';

interface ZeroSheetHeaderProps {
    children: React.ReactNode;
    duration?: number;
}

const ZeroSheetHeader: React.FC<ZeroSheetHeaderProps> = ({
    children,
    duration = 300,
}) => {

    const { headerContentHeight, setHeaderContentHeight, fixedHeaderHeight } = useZeroSheetContext();


    const animatedHeight = useRef(new Animated.Value(0)).current;


    const lastLayoutHeight = useRef(0);


    const onLayout = (e: LayoutChangeEvent) => {

        let newHeight = Math.round(e.nativeEvent.layout.height);
        lastLayoutHeight.current = newHeight;


        if (fixedHeaderHeight) {

            if (headerContentHeight !== fixedHeaderHeight) {
                setHeaderContentHeight(fixedHeaderHeight);
            }

            return;
        }







        if (newHeight !== headerContentHeight) {
            setHeaderContentHeight(newHeight);
        }

    };

    useEffect(() => {
        if (fixedHeaderHeight) {
            if (headerContentHeight !== fixedHeaderHeight) {
                setHeaderContentHeight(fixedHeaderHeight);
            }
        } else {
            if (lastLayoutHeight.current !== headerContentHeight) {
                setHeaderContentHeight(lastLayoutHeight.current);
            }
        }
    }, [fixedHeaderHeight, headerContentHeight, setHeaderContentHeight]);


    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: headerContentHeight,
            duration,
            useNativeDriver: false, // nativeDriver не поддерживает height
        }).start(() => {

        })
    }, [headerContentHeight, duration, animatedHeight]);



    return (
        <Animated.View style={{ height: animatedHeight, overflow: 'hidden' }}>
            <ScrollView
                scrollEnabled={false}
                keyboardShouldPersistTaps="always"
                overScrollMode="always"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <View onLayout={onLayout}>
                    {children}
                </View>
            </ScrollView>
        </Animated.View>
    );
};

export default ZeroSheetHeader;