import { useSafeArea } from '../hooks/useSafeArea';

export default function SafeAreaDemo() {
  const { safeAreaInsets, isLoading } = useSafeArea();

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-muted">Loading safe area information...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold theme-text">Safe Area Information</h2>
      
      <div className="card p-4 space-y-2">
        <h3 className="font-medium theme-text">Safe Area Insets:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Top:</span>
            <span className="font-mono">{safeAreaInsets.top}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Bottom:</span>
            <span className="font-mono">{safeAreaInsets.bottom}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Left:</span>
            <span className="font-mono">{safeAreaInsets.left}px</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Right:</span>
            <span className="font-mono">{safeAreaInsets.right}px</span>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium theme-text mb-2">CSS Variables:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">--safe-area-inset-top:</span>
            <span className="font-mono">{getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0px'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">--safe-area-inset-bottom:</span>
            <span className="font-mono">{getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0px'}</span>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium theme-text mb-2">Usage Examples:</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>• Use <code className="bg-gray-100 px-1 rounded">pt-safe</code> for top padding</p>
          <p>• Use <code className="bg-gray-100 px-1 rounded">pb-safe</code> for bottom padding</p>
          <p>• Use <code className="bg-gray-100 px-1 rounded">safe-area-top</code> class for top safe area</p>
          <p>• Use <code className="bg-gray-100 px-1 rounded">safe-area-bottom</code> class for bottom safe area</p>
        </div>
      </div>
    </div>
  );
}
