import { useEffect, useState } from 'react';

export default function SafeAreaDebug() {
  const [safeAreaValues, setSafeAreaValues] = useState({
    top: '0px',
    bottom: '0px',
    left: '0px',
    right: '0px'
  });

  useEffect(() => {
    const updateValues = () => {
      const top = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0px';
      const bottom = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px';
      const left = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0px';
      const right = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0px';
      
      setSafeAreaValues({ top, bottom, left, right });
    };

    updateValues();
    
    // Update every second to see if values change
    const interval = setInterval(updateValues, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 bg-black text-white p-4 rounded-lg text-xs">
      <div className="font-bold mb-2">Safe Area Debug</div>
      <div>Top: {safeAreaValues.top}</div>
      <div>Bottom: {safeAreaValues.bottom}</div>
      <div>Left: {safeAreaValues.left}</div>
      <div>Right: {safeAreaValues.right}</div>
      <div className="mt-2 text-yellow-300">
        Screen: {window.innerWidth} x {window.innerHeight}
      </div>
    </div>
  );
}
