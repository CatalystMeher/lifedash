import { useState, useEffect } from 'react';
import { purchaseMonthly, restorePurchases, isProNow, isProductReady, getProductInfo } from '../lib/iap';
import { Crown, Check, Lock, RefreshCw, Info } from 'lucide-react';

export default function Paywall() {
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState(isProNow());
  const [productReady, setProductReady] = useState(false);
  const [error, setError] = useState('');
  const [productInfo, setProductInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Check product readiness on mount
    checkProductReady();
    
    // Check periodically
    const interval = setInterval(checkProductReady, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkProductReady = () => {
    const ready = isProductReady();
    setProductReady(ready);
    const info = getProductInfo();
    setProductInfo(info);
    if (ready) {
      setError('');
    }
  };

  async function handleBuy() {
    try {
      setBusy(true);
      setError('');
      
      if (!productReady) {
        throw new Error('Product not ready yet. Please wait a moment and try again.');
      }
      
      await purchaseMonthly();
      setOwned(isProNow());
      alert('Thanks! Pro unlocked (if not immediate, tap Restore).');
    } catch (e) {
      const errorMessage = e.message || 'Purchase failed';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setBusy(false);
    }
  }

  function handleRestore() {
    setBusy(true);
    setError('');
    restorePurchases();
    setTimeout(() => {
      setOwned(isProNow());
      setBusy(false);
    }, 1500);
  }

  if (owned) {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-green-800 dark:text-green-200">Pro Unlocked!</div>
            <div className="text-sm text-green-600 dark:text-green-300">You have access to all premium features</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-purple-800 dark:text-purple-200">Upgrade to Pro</div>
            <div className="text-sm text-purple-600 dark:text-purple-300">Unlock premium features</div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-purple-700 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Unlimited habits and stats</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Advanced analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Priority support</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      <div className="space-y-3">
        <button 
          disabled={busy || !productReady} 
          onClick={handleBuy}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {busy ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : !productReady ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Loading Product...
            </>
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Get Pro - Monthly
            </>
          )}
        </button>
        
        <button 
          disabled={busy} 
          onClick={handleRestore}
          className="w-full px-4 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium rounded-xl transition-all duration-200 border border-purple-200 dark:border-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Restoring...' : 'Restore Previous Purchase'}
        </button>
      </div>

      {!productReady && (
        <div className="text-center">
          <button 
            onClick={checkProductReady}
            className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            Retry loading product
          </button>
        </div>
      )}

      {/* Debug Information */}
      <div className="mt-4">
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Info className="w-4 h-4" />
          {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
        
        {showDebug && (
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-900/20 dark:border-gray-800">
            <div className="text-xs font-mono space-y-1">
              <div><strong>Product Ready:</strong> {productReady ? 'Yes' : 'No'}</div>
              <div><strong>Product Info:</strong></div>
              {productInfo ? (
                <div className="ml-2 space-y-1">
                  <div>ID: {productInfo.id}</div>
                  <div>Title: {productInfo.title || 'N/A'}</div>
                  <div>Description: {productInfo.description || 'N/A'}</div>
                  <div>Price: {productInfo.price || 'N/A'}</div>
                  <div>Can Purchase: {productInfo.canPurchase ? 'Yes' : 'No'}</div>
                  <div>Owned: {productInfo.owned ? 'Yes' : 'No'}</div>
                  <div>State: {productInfo.state || 'N/A'}</div>
                </div>
              ) : (
                <div className="ml-2 text-red-500">No product info available</div>
              )}
              <div><strong>Platform:</strong> TEST (Development)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
