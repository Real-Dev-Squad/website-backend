import config from "config";
import sinon from "sinon";
import passport from "passport";

const defaultClientId = config.get("googleOauth.clientId");
const baseURL = config.get("services.rdsApi.baseUrl");

const generateGoogleAuthRedirectUrl = function ({
  baseUrl = "https://accounts.google.com/o/oauth2/v2/auth",
  responseType = "code",
  redirectUri = `${baseURL}/auth/google/callback`,
  scope = "email",
  state = "",
  clientId = defaultClientId,
}) {
  const encodedBaseUrl = encodeURI(baseUrl);
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const encodedScope = encodeURIComponent(scope);
  let encodedUrl = `${encodedBaseUrl}?response_type=${responseType}&redirect_uri=${encodedRedirectUri}&scope=${encodedScope}`;
  if (state) {
    encodedUrl += `&state=${encodeURIComponent(state)}`;
  }
  return `${encodedUrl}&client_id=${clientId}`;
};

const stubPassportAuthenticate = function (userData, token = "accessToken") {
  return sinon.stub(passport, "authenticate").callsFake((strategy, options, callback) => {
    callback(null, token, userData);
    return (req, res, next) => {};
  });
};

export { generateGoogleAuthRedirectUrl, stubPassportAuthenticate };
