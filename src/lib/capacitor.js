import { App } from '@capacitor/app';
import { Haptics } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import { SafeArea } from '@capacitor-community/safe-area';
import '@capacitor-community/safe-area';

// Initialize Capacitor plugins
export const initializeCapacitor = async () => {
  try {
    // Set status bar style with overlay support
    await StatusBar.setStyle({ style: 'DARK' });
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setBackgroundColor({ color: '#00000000' }); // transparent
    
    // Set keyboard behavior
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
    
    // Initialize safe area support
    await initializeSafeAreas();
    
    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive);
      if (isActive) {
        // Re-initialize safe areas when app becomes active
        setTimeout(() => initializeSafeAreas(), 100);
      }
    });

    App.addListener('appUrlOpen', (data) => {
      console.log('App opened with URL:', data.url);
    });

    App.addListener('appRestoredResult', (data) => {
      console.log('Restored result:', data);
    });

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
};

// Initialize safe area support
const initializeSafeAreas = async () => {
  try {
    // Enable the safe area plugin with configuration
    await SafeArea.enable({
      config: {
        customColorsForSystemBars: true,
        statusBarColor: '#00000000', // transparent
        statusBarContent: 'dark',
        navigationBarColor: '#00000000', // transparent
        navigationBarContent: 'dark',
        offset: 0,
      },
    });
    
    // Wait a bit for the plugin to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get status bar height and set CSS variable
    try {
      const statusBarInfo = await StatusBar.getInfo();
      const statusBarHeight = statusBarInfo.height || 0;
      document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
      console.log('Status bar height:', statusBarHeight);
    } catch (error) {
      console.log('Could not get status bar height:', error);
    }
    
    // Check if CSS variables are set
    const topInset = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top');
    const bottomInset = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom');
    
    console.log('Safe area plugin enabled successfully');
    console.log('Top inset:', topInset);
    console.log('Bottom inset:', bottomInset);
    
    // If variables are not set, set fallback values for testing
    if (!topInset || topInset === '0px') {
      console.log('Setting fallback safe area values');
      document.documentElement.style.setProperty('--safe-area-inset-top', '44px');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', '34px');
    }
    
  } catch (error) {
    console.error('Error initializing safe areas:', error);
    
    // Fallback for web/PWA, use CSS env() values
    if (typeof window !== 'undefined' && window.CSS && window.CSS.supports) {
      if (window.CSS.supports('padding-top', 'env(safe-area-inset-top)')) {
        console.log('Using browser safe area environment variables as fallback');
        return;
      }
    }
    
    console.log('Safe areas will be handled by native code');
  }
};

// Utility function for haptic feedback
export const triggerHaptic = async (type = 'light') => {
  try {
    await Haptics.impact({ style: type });
  } catch (error) {
    console.error('Haptic feedback error:', error);
  }
};

// Utility function for selection haptic
export const triggerSelection = async () => {
  try {
    await Haptics.selectionStart();
  } catch (error) {
    console.error('Selection haptic error:', error);
  }
};
