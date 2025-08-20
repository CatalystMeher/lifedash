# Safe Area Plugin Setup

This document explains how the `@capacitor-community/safe-area` plugin has been integrated into your LifeDash app to prevent UI elements from extending beyond safe area boundaries on mobile devices.

## What's Been Added

### 1. Plugin Installation
- ✅ `@capacitor-community/safe-area` installed (official Capacitor community plugin)
- ✅ Plugin automatically initializes when the app starts

### 2. Integration Files

#### `src/lib/capacitor.js`
- Updated to import and initialize the official SafeArea plugin
- Enables the plugin with proper configuration for system bars
- Sets up transparent status bar and navigation bar
- Provides fallback for web/PWA environments

#### `src/hooks/useSafeArea.js`
- React hook for accessing safe area information
- Reads CSS custom properties set by the plugin
- Uses MutationObserver to detect changes in real-time

#### `tailwind.config.js`
- Added custom Tailwind utilities for safe area spacing
- New classes: `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe`, etc.

#### `src/components/SafeAreaDemo.jsx`
- Demo component showing safe area information
- Useful for testing and debugging

## How It Works

### Automatic Initialization
The plugin automatically:
1. Enables edge-to-edge mode with transparent system bars
2. Sets CSS custom properties on `document.documentElement`
3. Handles safe area insets for notches and home indicators
4. Works seamlessly across iOS, Android, and web platforms

### CSS Custom Properties Set
The plugin sets these CSS custom properties on `document.documentElement`:
```css
--safe-area-inset-top: 44px
--safe-area-inset-bottom: 34px
--safe-area-inset-left: 0px
--safe-area-inset-right: 0px
--status-bar-height: 44px
```

These properties are then used by the existing CSS classes without any redundant calculations.

## Usage Examples

### 1. Using Existing CSS Classes
Your layout now uses these classes correctly:
```jsx
<div className="safe-area-top"> {/* Top only - for headers */}
<div className="safe-area-bottom"> {/* Bottom only - for tab bars */}
<div className="fab-bottom-mobile"> {/* FAB positioning with safe area */}
```

### 2. Using New Tailwind Utilities
```jsx
<div className="pt-safe"> {/* Top padding */}
<div className="pb-safe"> {/* Bottom padding */}
<div className="pl-safe pr-safe"> {/* Left and right padding */}
```

### 3. Using the Hook
```jsx
import { useSafeArea } from '../hooks/useSafeArea';

function MyComponent() {
  const { safeAreaInsets, statusBarHeight } = useSafeArea();
  
  return (
    <div style={{ paddingTop: `${safeAreaInsets.top}px` }}>
      Content with custom safe area padding
    </div>
  );
}
```

### 4. Manual CSS
```css
.my-element {
  padding-top: var(--safe-area-inset-top, 0px);
  padding-bottom: var(--safe-area-inset-bottom, 0px);
}
```

## Components Already Protected

Your app now has proper safe area protection on:
- ✅ Main layout (`MainLayout.jsx`) - uses `safe-area-top` for header only
- ✅ Calendar layout (`CalendarLayout.jsx`) - uses `safe-area-top` for header only  
- ✅ Tab bar (`TabBar.jsx`) - positioned at bottom with official plugin handling safe areas
- ✅ FAB button (`FAB.jsx`) - positioned with reduced bottom spacing
- ✅ Modal components - no extra safe area padding (fixed)
- ✅ Fullscreen components - no extra safe area padding (fixed)
- ✅ Auth pages - no extra safe area padding (fixed)

## Testing

### Web Development
- Safe area values will be 0px in web browsers
- Use browser dev tools to simulate mobile devices
- Test with different device orientations

### Mobile Testing
- Build and run on actual devices
- Test on devices with notches (iPhone X and newer)
- Test on devices with home indicators
- Test orientation changes

### Demo Component
Add the `SafeAreaDemo` component to any page to see current safe area values:
```jsx
import SafeAreaDemo from '../components/SafeAreaDemo';

// In your component
<SafeAreaDemo />
```

## Troubleshooting

### Plugin Not Working
1. Ensure you're running on a real device (not simulator)
2. Check that the plugin is properly synced: `npx cap sync android`
3. Verify the plugin is imported in `capacitor.js`

### CSS Variables Not Set
1. Check browser console for errors
2. Verify the plugin initialization in `capacitor.js`
3. Ensure the app has proper permissions

### Layout Issues
1. Use the existing safe area classes
2. Test with the `SafeAreaDemo` component
3. Check that your components use the proper positioning classes

## Additional Resources

- [Official Plugin Documentation](https://github.com/capacitor-community/safe-area)
- [Capacitor Community Safe Area](https://www.npmjs.com/package/@capacitor-community/safe-area)
- [CSS Environment Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/env)

## Next Steps

1. Test the app on real devices with notches
2. Verify all UI elements respect safe areas
3. Test orientation changes
4. Consider adding the Tailwind safe area plugin for even more utilities
