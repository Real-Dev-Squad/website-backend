const defaultClientId = config.get("githubOauth.clientId");

const generateGithubAuthRedirectUrl = function ({
  baseUrl = "https://github.com/login/oauth/authorize",
  responseType = "code",
  redirectUri = "http://localhost:3000/auth/github/callback",
  scope = "user:email",
  state = "",
  clientId = defaultClientId,
  isMobileApp = false,
}) {
  const encodedBaseUrl = encodeURI(baseUrl);
  const encodedRedirectUri = encodeURIComponent(redirectUri);
  const encodedScope = encodeURIComponent(scope);
  let encodedUrl = `${encodedBaseUrl}?response_type=${responseType}&redirect_uri=${encodedRedirectUri}&scope=${encodedScope}`;
  if (state) {
    encodedUrl += `&state=${encodeURIComponent(state)}`;
  }
  if (isMobileApp) {
    encodedUrl += `&isMobileApp=${encodeURIComponent(true)}`;
  }
  return `${encodedUrl}&client_id=${clientId}`;
};

module.exports = { generateGithubAuthRedirectUrl };
