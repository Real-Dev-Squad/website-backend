export const CLOUDFLARE_WORKER = "Cloudflare Worker";
export const BAD_TOKEN = "BAD.JWT.TOKEN";
export const CRON_JOB_HANDLER = "Cron Job Handler";
export const DISCORD_SERVICE = "Discord Service";

export const Services = {
  CLOUDFLARE_WORKER: CLOUDFLARE_WORKER,
  CRON_JOB_HANDLER: CRON_JOB_HANDLER,
};

export const DiscordServiceHeader = {
  name: "x-service-name"
}

export default { CLOUDFLARE_WORKER, BAD_TOKEN, CRON_JOB_HANDLER, Services, DISCORD_SERVICE, DiscordServiceHeader };
