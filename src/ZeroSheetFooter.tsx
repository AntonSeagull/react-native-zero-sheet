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

interface ZeroSheetFooterProps {
    children: React.ReactNode;
    duration?: number;
}

const ZeroSheetFooter: React.FC<ZeroSheetFooterProps> = ({
    children,
    duration = 300,
}) => {

    const { footerContentHeight, setFooterContentHeight, fixedFooterHeight } = useZeroSheetContext();

    const animatedHeight = useRef(new Animated.Value(0)).current;

    const lastLayoutHeight = useRef(0);

    const onLayout = (e: LayoutChangeEvent) => {



        let newHeight = Math.round(e.nativeEvent.layout.height);
        lastLayoutHeight.current = newHeight;

        if (fixedFooterHeight) {

            if (footerContentHeight !== fixedFooterHeight) {
                setFooterContentHeight(fixedFooterHeight);
            }

            return;
        }




        if (newHeight !== footerContentHeight) {
            setFooterContentHeight(newHeight);
        }

    };


    useEffect(() => {
        Animated.timing(animatedHeight, {
            toValue: footerContentHeight,
            duration,
            useNativeDriver: false, // nativeDriver не поддерживает height
        }).start(() => {

        })
    }, [footerContentHeight, duration, animatedHeight]);


    useEffect(() => {
        if (fixedFooterHeight) {
            if (footerContentHeight !== fixedFooterHeight) {
                setFooterContentHeight(fixedFooterHeight);
            }
        } else {
            if (lastLayoutHeight.current !== footerContentHeight) {
                setFooterContentHeight(lastLayoutHeight.current);
            }
        }
    }, [fixedFooterHeight, footerContentHeight, setFooterContentHeight]);


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

export default ZeroSheetFooter;