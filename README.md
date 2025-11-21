# react-native-zero-sheet

Мощный и гибкий компонент bottom sheet для React Native с поддержкой drag-to-close, автоматической обработкой клавиатуры и адаптивными размерами.

> **Примечание:** Название "zero" означает, что библиотека работает без дополнительных зависимостей (кроме стандартных для React Native).

## Особенности

- 🎯 **Drag to Close** - перетаскивание для закрытия модального окна
- ⌨️ **Автоматическая обработка клавиатуры** - автоматическая адаптация высоты при появлении клавиатуры
- 📱 **Safe Area Support** - автоматическая поддержка safe area insets
- 🎨 **Гибкая структура** - разделение на Header, Content и Footer
- ⚡ **Производительность** - оптимизированные анимации с использованием Animated API
- 🎛️ **Полная кастомизация** - настройка стилей, цветов и поведения
- 📏 **Фиксированные размеры** - поддержка фиксированных высот для секций
- 🔄 **Контролируемое состояние** - поддержка controlled и uncontrolled режимов

## Установка

```bash
npm install react-native-zero-sheet
# или
yarn add react-native-zero-sheet
```

### Требования

Библиотека требует `react-native-safe-area-context` для работы с safe area insets:

```bash
npm install react-native-safe-area-context
# или
yarn add react-native-safe-area-context
```

Убедитесь, что ваш корневой компонент обернут в `SafeAreaProvider`:

```tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return <SafeAreaProvider>{/* Ваш код */}</SafeAreaProvider>;
}
```

## Быстрый старт

```tsx
import React, { useRef } from 'react';
import { View, Button, Text } from 'react-native';
import ZeroSheet, { ZeroSheetHandle } from 'react-native-zero-sheet';

function App() {
  const sheetRef = useRef<ZeroSheetHandle>(null);

  return (
    <View>
      <Button title="Открыть Sheet" onPress={() => sheetRef.current?.open()} />

      <ZeroSheet
        ref={sheetRef}
        header={
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Заголовок</Text>
          </View>
        }
        footer={
          <View style={{ padding: 20 }}>
            <Button title="Закрыть" onPress={() => sheetRef.current?.close()} />
          </View>
        }
      >
        <View style={{ padding: 20 }}>
          <Text>Контент модального окна</Text>
        </View>
      </ZeroSheet>
    </View>
  );
}
```

## Примеры использования

### Базовое использование с контролируемым состоянием

```tsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import ZeroSheet from 'react-native-zero-sheet';

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Button title="Открыть" onPress={() => setVisible(true)} />

      <ZeroSheet
        visible={visible}
        onChange={(open) => setVisible(open)}
        header={
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Заголовок</Text>
          </View>
        }
      >
        <View style={{ padding: 20 }}>
          <Text>Контент</Text>
        </View>
      </ZeroSheet>
    </View>
  );
}
```

### Использование с фиксированными размерами

```tsx
<ZeroSheet
  visible={visible}
  fixedHeaderHeight={60}
  fixedFooterHeight={80}
  fixedContentHeight={400}
  header={<HeaderComponent />}
  footer={<FooterComponent />}
>
  <ContentComponent />
</ZeroSheet>
```

### Кастомизация стилей

```tsx
<ZeroSheet
  visible={visible}
  backgroundColor="#f5f5f5"
  buttonColor="#ffffff"
  draggableHeight={30}
  customStyles={{
    wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
    container: { borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    draggableIcon: { backgroundColor: '#ccc', width: 40, height: 4 },
  }}
>
  <ContentComponent />
</ZeroSheet>
```

### Отключение drag-to-close и backdrop

```tsx
<ZeroSheet
  visible={visible}
  draggable={false}
  backdrop={false}
  closeByBackdropClick={false}
>
  <ContentComponent />
</ZeroSheet>
```

### Обработка событий жизненного цикла

```tsx
<ZeroSheet
  visible={visible}
  onSheetOpen={() => console.log('Sheet открывается')}
  onSheetOpened={() => console.log('Sheet открыт')}
  onSheetClose={() => console.log('Sheet закрывается')}
  onSheetClosed={() => console.log('Sheet закрыт')}
  onManualClose={() => console.log('Закрытие вручную')}
  onChange={(open) => console.log('Состояние изменилось:', open)}
>
  <ContentComponent />
</ZeroSheet>
```

### Использование с кастомным фоном

```tsx
<ZeroSheet
  visible={visible}
  renderBackground={
    <Image
      source={require('./background.png')}
      style={{ width: '100%', height: '100%' }}
    />
  }
>
  <ContentComponent />
</ZeroSheet>
```

### Отключение safe area insets

```tsx
<ZeroSheet visible={visible} noTopInset={true} noBottomInset={true}>
  <ContentComponent />
</ZeroSheet>
```

## API

### ZeroSheet Props

| Prop                   | Type                      | Default  | Description                                      |
| ---------------------- | ------------------------- | -------- | ------------------------------------------------ |
| `visible`              | `boolean`                 | -        | Контролируемое состояние видимости               |
| `onChange`             | `(open: boolean) => void` | -        | Колбэк при изменении состояния                   |
| `draggable`            | `boolean`                 | `true`   | Включить возможность перетаскивания для закрытия |
| `draggableHeight`      | `number`                  | `25`     | Высота области для перетаскивания                |
| `backdrop`             | `boolean`                 | `true`   | Показывать затемненный фон                       |
| `closeByBackdropClick` | `boolean`                 | `true`   | Закрывать при клике на фон                       |
| `backgroundColor`      | `string`                  | `'#fff'` | Цвет фона sheet                                  |
| `buttonColor`          | `string`                  | -        | Цвет нижней области (safe area)                  |
| `noTopInset`           | `boolean`                 | `false`  | Не добавлять верхний safe area inset             |
| `noBottomInset`        | `boolean`                 | `false`  | Не добавлять нижний safe area inset              |
| `header`               | `React.ReactNode`         | -        | Контент заголовка                                |
| `footer`               | `React.ReactNode`         | -        | Контент футера                                   |
| `fixedHeaderHeight`    | `number`                  | -        | Фиксированная высота заголовка                   |
| `fixedFooterHeight`    | `number`                  | -        | Фиксированная высота футера                      |
| `fixedContentHeight`   | `number`                  | -        | Фиксированная высота контента                    |
| `before`               | `React.ReactNode`         | -        | Элемент перед контентом                          |
| `renderBackground`     | `React.ReactNode`         | -        | Кастомный фон sheet                              |
| `customStyles`         | `CustomStyles`            | `{}`     | Кастомные стили                                  |
| `onSheetOpen`          | `() => void`              | -        | Колбэк при начале открытия                       |
| `onSheetOpened`        | `() => void`              | -        | Колбэк после открытия                            |
| `onSheetClose`         | `() => void`              | -        | Колбэк при начале закрытия                       |
| `onSheetClosed`        | `() => void`              | -        | Колбэк после закрытия                            |
| `onManualClose`        | `() => void`              | -        | Колбэк при ручном закрытии (drag или backdrop)   |
| `children`             | `React.ReactNode`         | -        | Контент sheet                                    |

### CustomStyles

```typescript
type CustomStyles = {
  wrapper?: ViewStyle;
  container?: ViewStyle;
  draggableIcon?: ViewStyle;
};
```

### ZeroSheetHandle (Ref методы)

```typescript
interface ZeroSheetHandle {
  open: () => void;
  close: () => void;
  expand: () => void; // Алиас для open()
}
```

### Компоненты

Библиотека также экспортирует внутренние компоненты для более гибкого использования:

- `ZeroSheetHeader` - компонент заголовка с автоматической анимацией высоты
- `ZeroSheetContent` - компонент контента с поддержкой скролла
- `ZeroSheetFooter` - компонент футера с автоматической анимацией высоты

Эти компоненты автоматически используются внутри `ZeroSheet`, но могут быть использованы напрямую при необходимости.

## Типы

Библиотека полностью типизирована с TypeScript. Все типы экспортируются:

```typescript
import ZeroSheet, { ZeroSheetHandle } from 'react-native-zero-sheet';
```

## Требования

- React Native >= 0.60
- react-native-safe-area-context
- React >= 16.8 (для hooks)
