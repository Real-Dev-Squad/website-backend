const MAX_CACHE_PURGE_COUNT = 3;
const CLOUDFLARE_ZONE_ID = config.get("cloudflare.CLOUDFLARE_ZONE_ID");
const CLOUDFLARE_PURGE_CACHE_API = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`;

module.exports = { MAX_CACHE_PURGE_COUNT, CLOUDFLARE_PURGE_CACHE_API };
