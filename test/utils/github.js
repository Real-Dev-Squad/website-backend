import config from "config";

const defaultClientId = config.get("githubOauth.clientId");
const baseURL = config.get("services.rdsApi.baseUrl");

const generateGithubAuthRedirectUrl = function ({
  baseUrl = "https://github.com/login/oauth/authorize",
  responseType = "code",
  redirectUri = `${baseURL}/auth/github/callback`,
  scope = "user:email",
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

export { generateGithubAuthRedirectUrl };
