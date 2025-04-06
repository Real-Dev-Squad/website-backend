import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "config";
import logger from "../utils/logger.js";

try {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.get("githubOauth.clientId"),
        clientSecret: config.get("githubOauth.clientSecret"),
        callbackURL: `${config.get("services.rdsApi.baseUrl")}/auth/github/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, accessToken, profile);
      }
    )
  );
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.get("googleOauth.clientId"),
        clientSecret: config.get("googleOauth.clientSecret"),
        callbackURL: `${config.get("services.rdsApi.baseUrl")}/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, accessToken, profile);
      }
    )
  );
} catch (err) {
  logger.error("Error initialising passport:", err);
}
