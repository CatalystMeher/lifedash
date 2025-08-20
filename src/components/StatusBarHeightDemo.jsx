import { useStatusBarHeight } from '../hooks/useStatusBarHeight';

export default function StatusBarHeightDemo() {
  const { statusBarHeight, isLoading } = useStatusBarHeight();

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-muted">Loading status bar height...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold theme-text">Status Bar Height</h2>
      
      <div className="card p-4">
        <h3 className="font-medium theme-text mb-2">Status Bar Height:</h3>
        <p className="font-mono text-lg">{statusBarHeight}px</p>
      </div>

      <div className="card p-4">
        <h3 className="font-medium theme-text mb-2">CSS Variable:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">--status-bar-height:</span>
            <span className="font-mono">{getComputedStyle(document.documentElement).getPropertyValue('--status-bar-height') || '0px'}</span>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium theme-text mb-2">Usage Examples:</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>• Use <code className="bg-gray-100 px-1 rounded">var(--status-bar-height)</code> in CSS</p>
          <p>• Use <code className="bg-gray-100 px-1 rounded">useStatusBarHeight()</code> hook in React</p>
          <p>• Use <code className="bg-gray-100 px-1 rounded">StatusBar.getInfo()</code> directly</p>
        </div>
      </div>
    </div>
  );
}
