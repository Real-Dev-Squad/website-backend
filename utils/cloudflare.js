const { fetch } = require("../utils/fetch");

const CLOUDFLARE_ZONE_ID = config.get("cloudflare.CLOUDFLARE_ZONE_ID");
const CLOUDFLARE_PURGE_CACHE_API = `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`;

async function cloudflarePurgeCache(files) {
  const response = await fetch(
    CLOUDFLARE_PURGE_CACHE_API,
    "POST",
    null,
    { files: files },
    {
      "X-Auth-Key": config.get("cloudflare.CLOUDFLARE_X_AUTH_KEY"),
      "X-Auth-Email": config.get("cloudflare.CLOUDFLARE_X_AUTH_EMAIL"),
    }
  );

  return response;
}

module.exports = {
  cloudflarePurgeCache,
};
