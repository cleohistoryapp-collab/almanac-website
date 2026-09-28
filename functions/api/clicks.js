/**
 * Click counts for the bio-link router, so the marketing pipeline can put real
 * numbers in performance.csv instead of leaving go_clicks empty.
 *
 *   /api/clicks?key=<STATS_KEY>            every day
 *   /api/clicks?key=...&day=2026-09-28     one day
 *
 * Returns {day: {campaign: {source: {platform: n}}}}. The key is a shared
 * secret set as a Pages environment variable; without it this would publish
 * our campaign performance to anyone who guessed the URL.
 */
export async function onRequest({request, env}) {
  const url = new URL(request.url);
  if (!env.STATS_KEY || url.searchParams.get('key') !== env.STATS_KEY) {
    return new Response('not found', {status: 404});
  }
  if (!env.CLICKS) return Response.json({error: 'no CLICKS binding'}, {status: 500});

  const day = url.searchParams.get('day');
  const out = {};
  let cursor;
  do {
    const page = await env.CLICKS.list({prefix: day ? `${day}|` : undefined, cursor});
    for (const k of page.keys) {
      const [d, campaign, source] = k.name.split('|');
      out[d] ??= {};
      out[d][campaign] ??= {};
      out[d][campaign][source] = (out[d][campaign][source] || 0) + 1;
    }
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor);

  return Response.json(out, {headers: {'cache-control': 'no-store'}});
}
