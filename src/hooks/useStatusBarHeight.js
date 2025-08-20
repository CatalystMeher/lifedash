import { useState, useEffect } from 'react';
import { StatusBar } from '@capacitor/status-bar';

export const useStatusBarHeight = () => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStatusBarHeight = async () => {
      try {
        // Get status bar info
        const info = await StatusBar.getInfo();
        setStatusBarHeight(info.height || 0);
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting status bar height:', error);
        
        // Fallback: try to get from CSS custom property
        const height = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--status-bar-height')) || 0;
        setStatusBarHeight(height);
        setIsLoading(false);
      }
    };

    getStatusBarHeight();
  }, []);

  return {
    statusBarHeight,
    isLoading,
  };
};
