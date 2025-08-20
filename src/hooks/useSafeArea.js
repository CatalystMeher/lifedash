import { useState, useEffect } from 'react';

export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSafeAreaValues = () => {
      try {
        // Get safe area values from CSS custom properties
        const top = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0;
        const right = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right')) || 0;
        const bottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom')) || 0;
        const left = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left')) || 0;

        setSafeAreaInsets({ top, right, bottom, left });
        setIsLoading(false);
      } catch (error) {
        console.error('Error getting safe area values:', error);
        setIsLoading(false);
      }
    };

    // Get initial values
    getSafeAreaValues();

    // Set up a mutation observer to watch for changes in CSS custom properties
    const observer = new MutationObserver(() => {
      getSafeAreaValues();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    safeAreaInsets,
    isLoading,
  };
};
