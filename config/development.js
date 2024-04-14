/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */

const port = 3000;
const localUrl = `http://localhost:${port}`;

module.exports = {
  port: port,
  enableFileLogs: false,
  enableConsoleLogs: true,
  discordNewComersChannelId: "709080951824842783",

  services: {
    rdsApi: {
      baseUrl: localUrl,
    },

    rdsUi: {
      baseUrl: localUrl,
      routes: {
        authRedirection: "/healthcheck",
      },
    },

    goalAPI: {
      baseUrl: "https://staging-goals-api.realdevsquad.com",
      secretKey: "123456789",
    },
  },

  userToken: {
    publicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHo6sGbw8qk+XU9sBVa4w2aEq01i\n" +
      "oKDMFFQa9mPy0MRScTCsrfEjbypD4VqIjJcwXGmDWKVhMcJ8SMZuJumIJ10vU9ca\n" +
      "WSh/aHhAxiOIqOEe54IyYTwjcn5avdZry3zl62RYQ7tDZCPAR/WvFCIkgRXwjXfC\n" +
      "Xpm4LR6ynKDMvsDNAgMBAAE=\n" +
      "-----END PUBLIC KEY-----",
    privateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIICWwIBAAKBgHo6sGbw8qk+XU9sBVa4w2aEq01ioKDMFFQa9mPy0MRScTCsrfEj\n" +
      "bypD4VqIjJcwXGmDWKVhMcJ8SMZuJumIJ10vU9caWSh/aHhAxiOIqOEe54IyYTwj\n" +
      "cn5avdZry3zl62RYQ7tDZCPAR/WvFCIkgRXwjXfCXpm4LR6ynKDMvsDNAgMBAAEC\n" +
      "gYAhxa2QA+tIkA7ALxyahZqX7PhX/XRceYb0Zi7GFwVP+WeFB3FYO24vw2m01h3i\n" +
      "eF5QWRZZO63ACw8gpLbjt9cIJoGU0HG2qa81hc+EuxEIQMxZKYWc4Xh2YeMxZ0Z3\n" +
      "vOyd8ZtimVoLnP4rQBiX/NL6uFNJ86kvy4H3v6MGQaBgAQJBAOvwj49kH14XbONp\n" +
      "p925+AN5/4m44i0dA4PXfif6qRS/e40Y9c+yvvHhcG7evLo611TZvF0nE/nRcaG0\n" +
      "19VXDgECQQCEnx5Yl6DceCGhfSIAA/TmbquTBDXlhQpFxXFlAx0rpVZa9DKyAGFB\n" +
      "2Xt+BP0Po9cwV7GSEqjoWXsqpx9AfIrNAkEAgtpRFGqoBuwhBOMlKZCpX2w68Cvs\n" +
      "rK6Js4ZBPnUDbzFfmXp9Yeq1gbrRO3wm2XYm1LVJhbRVnNivF8sPZQ+6AQJAOqNk\n" +
      "NoWsgW64Z/+89cbKFMzgHdvhvL7rQNhBAAm1byPmn8aTV7LlTclMWfb4sV6e+ef8\n" +
      "QnrvpfRSihRktA2dDQJAH+dQBx3nG3bZ9khVAZQ1jTJ7j0cKixaGndFuYS1TJvJ2\n" +
      "Zzn584h/xbSIcP9/4SXmEK3wtoueUtMkvS3yKTvk+w==\n" +
      "-----END RSA PRIVATE KEY-----",
  },
  userTokenV2: {
    privateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "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\n" +
      "-----END RSA PRIVATE KEY-----",
  },

  botToken: {
    botPublicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBK3CkprcpAYxme7vtdjpWO\n" +
      "gFFjoYsqU3OmhMEty/s1gnW5tgbK4ief4xk+cU+mu3YvjzWudT/SV17tAWxL4Y+G\n" +
      "incJwL5gpQwlnw9qOAdRGkpBriQLec7kNVIydZXbUitziy+iSimxNzdDmjvlK9ZG\n" +
      "miVLZm+MePbUtgaIpfgd+4bRWzudlITiNmWY7HppLzyBw+037iEICM4kwPPFI+SO\n" +
      "GJhpAAmD6vk0MeZk1NeQmyQp/uOPpWmVRzgyK+XVc6AwZHV+/n6xAIT91/DjJlD1\n" +
      "N+nS7Sqo3RJ04+KlNRUclzINOC7JBYkKtG7YQ0U9nNLkRrRlON+O6tY4OT86T1O1\n" +
      "AgMBAAE=\n" +
      "-----END PUBLIC KEY-----",
  },

  integrations: {
    newrelic: {
      appName: "RDS_API_development",
    },
  },
};
