import {
  useEffect,
  useRef,
} from 'react';

import { Animated } from 'react-native';

interface ZeroSheetBoxProps {
    visible: boolean;
    height: number; // максимальная высота
    closeDuration?: number; // длительность закрытия (по умолчанию 1000 мс)
    openDuration?: number; // длительность открытия (по умолчанию 0 мс)
    style?: object;
}

const ZeroSheetBox: React.FC<ZeroSheetBoxProps> = ({
    visible,
    height,
    openDuration = 0,
    closeDuration = 200,
    style,
}) => {
    const animatedHeight = useRef(new Animated.Value(visible ? height : 0)).current;
    const isFirstRender = useRef(true);


    useEffect(() => {


        if (isFirstRender.current) {
            // Первый рендер → ставим без анимации
            animatedHeight.setValue(visible ? height : 0);
            isFirstRender.current = false;
        } else {
            if (visible) {

                if (openDuration === 0) {

                    // Открытие → сразу без анимации
                    animatedHeight.setValue(height);
                } else {
                    // Открытие → с анимацией
                    Animated.timing(animatedHeight, {
                        toValue: height,
                        duration: openDuration,
                        useNativeDriver: false, // высота на JS
                    }).start();
                }
            } else {

                if (closeDuration === 0) {
                    // Закрытие → сразу без анимации
                    animatedHeight.setValue(0);
                    return;
                } else {

                    // Закрытие → с анимацией
                    Animated.timing(animatedHeight, {
                        toValue: 0,
                        duration: closeDuration,
                        useNativeDriver: false, // высота на JS
                    }).start();
                }
            }
        }
    }, [visible, height, closeDuration, openDuration]);



    return (
        <Animated.View
            style={[
                style,
                {
                    backgroundColor: 'transparent',
                    height: animatedHeight,
                    overflow: 'hidden',
                },
            ]}
        />
    );
};

export default ZeroSheetBox;