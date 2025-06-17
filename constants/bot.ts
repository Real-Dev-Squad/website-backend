const CLOUDFLARE_WORKER = "Cloudflare Worker";
const BAD_TOKEN = "BAD.JWT.TOKEN";
const CRON_JOB_HANDLER = "Cron Job Handler";
const DISCORD_SERVICE = "Discord Service";

const Services = {
  CLOUDFLARE_WORKER: CLOUDFLARE_WORKER,
  CRON_JOB_HANDLER: CRON_JOB_HANDLER,
};

const DiscordServiceHeader = {
  name: "x-service-name"
}

module.exports = { CLOUDFLARE_WORKER, BAD_TOKEN, CRON_JOB_HANDLER, Services, DISCORD_SERVICE, DiscordServiceHeader };
