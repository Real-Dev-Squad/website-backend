import { REQUEST_LOG_TYPE } from "./requests";

export const logType = {
  PROFILE_DIFF_APPROVED: "profile_diff_approved",
  PROFILE_DIFF_REJECTED: "profile_diff_rejected",
  CLOUDFLARE_CACHE_PURGED: "cloudfare_cache_purged",
  APPLICATION_UPDATED: "user_application_updated",
  EVENTS_REMOVE_PEER: "events_remove_peer",
  APPLICATION_ADDED: "user_application_added",
  TASKS_MISSED_UPDATES_ERRORS: "tasks_missed_updates_errors",
  DISCORD_INVITES: "discord_invites",
  EXTERNAL_SERVICE: "external_service",
  EXTENSION_REQUESTS: "extensionRequests",
  TASK: "task",
  TASK_REQUESTS: "taskRequests",
  ...REQUEST_LOG_TYPE,
};

export const ALL_LOGS_FETCHED_SUCCESSFULLY = "All Logs fetched successfully";
export const LOGS_FETCHED_SUCCESSFULLY = "Logs fetched successfully";
export const ERROR_WHILE_FETCHING_LOGS = "Error while fetching logs";
