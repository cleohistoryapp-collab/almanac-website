/**
 * Bio-link router, server side.
 *
 * The page this replaces redirected with location.replace() as soon as it
 * loaded, which cancelled any analytics beacon before it could fire - so we
 * had no idea how many people a video actually sent to the store. Doing the
 * redirect here means every click is a request we see, and the logging happens
 * before the visitor leaves.
 *
 * Logging must never break the link: if the KV binding is missing or the write
 * fails, the visitor is still sent to the right store.
 */
const APP_STORE_ID = '6770077802';
const PLAY_ID = 'com.almanacstudios.pliny';
const APPLE_PROVIDER_TOKEN = '128580375';
// Must match campaigns created in App Store Connect, name for name; ct is
// case-sensitive and Apple discards values it does not recognise.
const APPLE_CAMPAIGNS = {tiktok: 'Tiktok', youtube: 'Youtube', instagram: 'Instagram'};

const iosUrl = (source) => {
  const ct = APPLE_CAMPAIGNS[source];
  const base = `https://apps.apple.com/app/apple-store/id${APP_STORE_ID}`;
  return ct ? `${base}?pt=${encodeURIComponent(APPLE_PROVIDER_TOKEN)}` +
              `&ct=${encodeURIComponent(ct)}&mt=8` : base;
};

const androidUrl = (campaign, source) => {
  const base = `https://play.google.com/store/apps/details?id=${PLAY_ID}`;
  if (!campaign) return base;
  const ref = `utm_source=${source}&utm_medium=organic&utm_campaign=${campaign}`;
  return `${base}&referrer=${encodeURIComponent(ref)}`;
};

async function log(env, row) {
  if (!env || !env.CLICKS) return;                 // no binding: skip quietly
  // One key per click rather than a counter: KV has no atomic increment, and
  // two clicks in the same second would otherwise overwrite each other.
  const key = `${row.day}|${row.campaign}|${row.source}|${crypto.randomUUID()}`;
  await env.CLICKS.put(key, JSON.stringify(row), {
    expirationTtl: 60 * 60 * 24 * 400,             // keep a year of clicks
  });
}

export async function onRequest(context) {
  const {request, env, next, waitUntil} = context;
  const q = new URL(request.url).searchParams;
  const campaign = (q.get('c') || '').slice(0, 40).replace(/[^\w.-]/g, '');
  const source = (q.get('s') || 'bio').slice(0, 40).replace(/[^\w.-]/g, '');

  const ua = request.headers.get('user-agent') || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const platform = isIOS ? 'ios' : isAndroid ? 'android' : 'other';

  const row = {
    day: new Date().toISOString().slice(0, 10),
    campaign: campaign || '(none)',
    source: source || '(none)',
    platform,
    country: request.headers.get('cf-ipcountry') || '',
    at: new Date().toISOString(),
  };
  // Never let logging delay or break the redirect.
  try {
    waitUntil(log(env, row).catch(() => {}));
  } catch (e) { /* ignore */ }

  if (isIOS) return Response.redirect(iosUrl(source), 302);
  if (isAndroid) return Response.redirect(androidUrl(campaign, source), 302);
  // Desktop, or a device we cannot place: the existing page lets them choose.
  return next();
}
