/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */

const port = 3000;

module.exports = {
  enableFileLogs: false,
  // Console logs are set to avoid the winston error of no defined transports
  enableConsoleLogs: true,

  githubOauth: {
    clientId: "clientId",
    clientSecret: "clientSecret",
  },
  firestore: `{
    "type": "service_account",
    "project_id": "test-project-id-for-emulator",
    "private_key_id": "test-private-key",
    "private_key": "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDaHHM8SL5skUp2\\nmbHnSBbJyk60O+nsq4hV23Ii3HLhe82Rndwji5DvAXv5AFKM9h2pQ3P2iZA7LQ4+\\nJ3BbTR1HgUDEuARlLz9C/CxKOtpM/2Hh5rKZkCxEUTulpJgW4XT16+qXdamaH2xz\\n/Cuec1H43HUuTZTj58yypCOh6SIZGOv4TQtMiz2DNKOktlhBr0GyN8+bsDgmEcoR\\n7DUeC5re2kcOHGqtzRoZhEPHWRcM40IjT0IffALUlqXQ/kYrWbbyPIHfo/ojxfeR\\nbLXLvWaCK+j9k28hvOb3nC0lWS+B/LerFzMF3q4vE1MjwAj2uU2DdhZXvTe8bnYR\\ntshsmRURAgMBAAECggEACZiWl9SF/0IRrf/jWD7/VKu4VHzt1O4zkn50CjVbfxDq\\nuZFB0BUKAH/217zURPQnmCy574L8I+Res+yZiITPKNgWlMkZVWfTn1N3seDevaQ/\\nRth262Nw1SUjTA1+rQQImLDDWpxQRNIE3CIAO8mMVdgCNlIuvquyQXpQAIXArKyr\\njsP8HFKYBb515Hn4NSO9eG8u1Mp+3hTMmwjb6k33ezDh3kJo9u0FTPOSD67GuMJv\\nXHbB96+xYDBa9vCqEHCukqtmTz1Bg3Oe47X/QlJWNOxqSBZ+ikfxWSF7DPt1r+5w\\nWHHlFsUvirHEug8tsLVmKv0hkU1TicE0ktjF8X6HGQKBgQD8/z4K1AkPX1gq/9jc\\nQcErZXBI8eYZOUJywJ5Cw4fiVq1VByqgBqr9sfJdkWi8WrWkDLCEf4h4Fy/yKClh\\nW/A5qHbkC8B9LWPiYJw++8FUpUHDPkxA+Szeq5UDkJH2aumcFwGdMywUvh0sVqwv\\nbvhYDtlanQSEGAvCd+NiQgNDyQKBgQDcszQO7S0EGpABGc6bkGvAlbmHqhUV5TzA\\ndvanSFXQ3f+MhboMUuZiDwpplvvqeAKc3Y3d2Ps6OPVD+ailL8QjN9FQ1sHZeuHy\\nckUYxaenspNdP6AWQxEAzJqHdpzV3EyJvMsDmhhaNwNSJ4vuZ53mVrh+6u4TWyks\\nUko2O2mbCQKBgQD1qov+S8K4cKbWqjVUO21tzERqMKp0l8tUToHe5qtON0h8pkbX\\nuWHUkzR7czU2oQZ8U+4b2xMTOcDO7fywk2wDMPixnE+/vZGeQp218xTaMtZW1mmJ\\nNexCFG7QVVPG6i4J6bUhho0pXypI4ai1LpZsO48HlCzMb+ULYwsjYGJ3MQKBgFZt\\ns2hZB3UA9f4IXjnbr+bme5aeS82cTVNOAz/1eu3l0kr0n6xt1pz2KOy63QKwZs2J\\nkiIb9B6T6bDqF1pBP31PQaB3ychicBOjHl4aIZLxwvYUkZvGPeVjOuzrzXWO5UZX\\nceWCNiE2RA2rQQhm+ZYXxf6mAAAChjg+LaPZVn0JAoGAXBGDDjWORrbD7T7qSTim\\n8sVCMmBX385JhWZGwE1BbdS/eOpnKR4uVRKTsDS8Q0uN3sydaHv1uTQhk2eLKaWZ\\nSzda8nPVduaIiXm79YDpALDHFdjIGcTb/s0MRNLLt6sBNw0Ytma9KHg6tzpPpJwP\\n4TwE9j91+jzusl9988Eke6s=\\n-----END PRIVATE KEY-----\\n",
    "client_email": "firebase-adminsdk-hqc2v@dev-rds.iam.gserviceaccount.com",
    "client_id": "<client-id>",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hqc2v%40dev-rds.iam.gserviceaccount.com"
  }`,
  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`,
    },
  },

  cors: {
    allowedOrigins: /(https:\/\/([a-zA-Z0-9-_]+\.)?realdevsquad\.com$)|(localhost)/, // Allow realdevsquad.com, *.realdevsquad.com and localhost for non-production envs
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
};
