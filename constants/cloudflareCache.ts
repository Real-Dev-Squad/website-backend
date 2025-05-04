import config from 'config';

export const MAX_CACHE_PURGE_COUNT = 3;
export const CLOUDFLARE_ZONE_ID = config.get("cloudflare.CLOUDFLARE_ZONE_ID");
export const CLOUDFLARE_PURGE_CACHE_API = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`;
