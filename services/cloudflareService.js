import { fetch } from "../utils/fetch.js";
import { CLOUDFLARE_PURGE_CACHE_API } from "../constants/cloudflareCache.js";
import config from "config";

async function purgeCache(files) {
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

export { purgeCache };
