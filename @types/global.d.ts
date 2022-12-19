import config from "config";
import winston from "winston";

declare global {
  var config: config;
  var logger: winston.Logger;
}