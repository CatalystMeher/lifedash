// src/lib/iap.js
// Works on Capacitor + cordova-plugin-purchase
import 'cordova-plugin-purchase';

export const PRODUCT_ID = 'lifedash.pro.monthly';

// Set this to true ONLY for local UI/dev wiring (no real store).
// For real testing via Play Internal Testing, keep it FALSE.
const USE_TEST_PLATFORM = false;

let initialized = false;
let ready = false;

// —— internal helpers ——
function getStore() {
  if (typeof CdvPurchase === 'undefined') throw new Error('IAP bridge not available');
  return CdvPurchase.store;
}
function getPlatform() {
  return USE_TEST_PLATFORM ? CdvPurchase.Platform.TEST : CdvPurchase.Platform.GOOGLE_PLAY;
}
function product() {
  try { return getStore().get(PRODUCT_ID); } catch { return null; }
}
async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
export async function waitForOffer(productId = PRODUCT_ID, timeoutMs = 15000, intervalMs = 400) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    const p = product();
    const offer = p && p.getOffer && p.getOffer();
    if (offer) return offer;
    await wait(intervalMs);
  }
  throw new Error('Offer not available yet');
}

// —— public API ——
export function initIAP() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('deviceready', async () => {
    const { ProductType } = CdvPurchase;
    const platform = getPlatform();
    const store = getStore();

    console.log('[IAP] register', PRODUCT_ID, 'platform=', USE_TEST_PLATFORM ? 'TEST' : 'GOOGLE_PLAY');

    store.register([
      { id: PRODUCT_ID, type: ProductType.PAID_SUBSCRIPTION, platform }
    ]);

    store.when()
      .error(e => console.log('[IAP] error', e))
      .productUpdated(p => {
        if (!p || p.id !== PRODUCT_ID) return;
        const offer = p.getOffer && p.getOffer();
        console.log('[IAP] productUpdated', {
          id: p.id,
          canPurchase: !!p.canPurchase,
          owned: !!p.owned,
          hasOffer: !!offer,
          price: offer && offer.pricing && offer.pricing.price
        });
        if (offer) ready = true;
      })
      .approved(tx => {
        console.log('[IAP] approved', tx);
        // When you add a server validator, prefer tx.verify()
        tx.finish();
      })
      .verified(rcpt => {
        console.log('[IAP] verified', rcpt);
        rcpt.finish();
      });

    try {
      console.log('[IAP] initialize…');
      await store.initialize([platform]);
      console.log('[IAP] initialize() resolved');
      // safety net: poll once to flip "ready" if productUpdated hasn’t landed yet
      try {
        await waitForOffer(PRODUCT_ID, 15000);
        ready = true;
      } catch { /* swallow; UI will keep retrying */ }
    } catch (err) {
      console.error('[IAP] Initialization failed:', err);
    }
  }, { once: true });
}

export async function purchaseMonthly() {
  if (typeof CdvPurchase === 'undefined') {
    throw new Error('IAP not available - are you running on a device?');
  }
  // Ensure an offer exists (prevents “product not loaded yet”)
  const offer = await waitForOffer(PRODUCT_ID);
  const err = await offer.order(); // opens Google purchase sheet (GOOGLE_PLAY) or fake flow (TEST)
  if (err && err.code !== CdvPurchase.ErrorCode.PAYMENT_CANCELLED) {
    throw new Error(err.message || 'Purchase failed');
  }
}

export function restorePurchases() {
  try { getStore().restorePurchases(); } catch (e) { console.warn('[IAP] restore error', e); }
}

export function isProNow() {
  const p = product();
  return !!(p && p.owned);
}

export function isProductReady() {
  const p = product();
  const offer = p && p.getOffer && p.getOffer();
  return ready && !!offer;
}

export function getProductInfo() {
  const p = product();
  if (!p) return null;
  const offer = p.getOffer && p.getOffer();
  const pricing = offer && offer.pricing;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: pricing && pricing.price,   // localized price string
    canPurchase: !!p.canPurchase,
    owned: !!p.owned,
    state: p.state
  };
}
