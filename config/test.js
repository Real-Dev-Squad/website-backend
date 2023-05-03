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
    discordBot: {
      baseUrl: "DISCORD_BASE_URL",
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

  rdsServerlessBot: {
    rdsServerLessPublicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwTun7LqrEAU+iiC5KkjB\n" +
      "JMFECm9ICl3cam2RwagJnMgihU/odFov74eflSrRPiGazSrf8plddwU3TA3cZ842\n" +
      "MOChC1PRTNhHhnkWS6B5/siAsE69UbXzBZEgrxW6FpvAVW7z7IeKkSiHUAKDmuPM\n" +
      "k4UnPMUstSVzPEY6GKsyJx16ubPfv6+lU3lIfu4ogH8/joq1249vF13e0N+h+fep\n" +
      "i5spjjd/xNy5yn8vzM+fX5nHuFMsW2kNfH0WdzYiim+V92JPmEoF+SpKL1jd4hTt\n" +
      "9Obaa3DHQKetirsr/R+Zv9esB/RNUC25ipATiXoDFGb7aGtHpICaQo/K+xX88VF8\n" +
      "7QIDAQAB\n" +
      "-----END PUBLIC KEY-----",
    rdsServerLessPrivateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIIEpAIBAAKCAQEAwTun7LqrEAU+iiC5KkjBJMFECm9ICl3cam2RwagJnMgihU/o\n" +
      "dFov74eflSrRPiGazSrf8plddwU3TA3cZ842MOChC1PRTNhHhnkWS6B5/siAsE69\n" +
      "UbXzBZEgrxW6FpvAVW7z7IeKkSiHUAKDmuPMk4UnPMUstSVzPEY6GKsyJx16ubPf\n" +
      "v6+lU3lIfu4ogH8/joq1249vF13e0N+h+fepi5spjjd/xNy5yn8vzM+fX5nHuFMs\n" +
      "W2kNfH0WdzYiim+V92JPmEoF+SpKL1jd4hTt9Obaa3DHQKetirsr/R+Zv9esB/RN\n" +
      "UC25ipATiXoDFGb7aGtHpICaQo/K+xX88VF87QIDAQABAoIBAQCPvkD86R+3my8a\n" +
      "sZ0Mx3JmVR64ZG/Cxm/g/AEhfk8oQfjsErVpWG2wUcN0w5VEEtuFJA/T+CJ/F3I7\n" +
      "MVR0JAJL+c3TD1bzQzBx6EGdoJMf5SdWADz1O9S8n2kg1ZjImLRK2W661VlPAkcm\n" +
      "Tbh40FyuoK6/li3b0zAV9mfhUfjM/uQmRgPimgAAbF5j3mKUbf9bcnIDtq+9PKGb\n" +
      "kZG2ov+n5WqFv6BBJaG2NfYMeGdRXb/ne/FtUpyXFkZIJxEgtggBlkdtwd4Ts6ap\n" +
      "ItqwQvRxlyVit0XZJ5pkZnkRD2pyXyyrOkFeUhczu/QRCgiSNSZElvCF1/gGFBUa\n" +
      "dRZe4EBBAoGBAPfIti1XX1ryBbIyugU7p8+6wEVscbgHMnZQ43fV29J890lzTBBB\n" +
      "Z7xA8DqBsCmSYcUa0dgbMjId6ntq1rE/ietXkOVwfyfcSMaP4HEHVAIc7nDJYyd7\n" +
      "V8bwGCSGllGR8MRevgLb00m6VopYpj98/YryGQW1+zcJrYzEQ+zzGElzAoGBAMej\n" +
      "5NvIWzL4HPjDsV+UEQ16TZppBWqAxYBm2ORHn4u4fvquEHSibap3XtYGvbp57meT\n" +
      "h2ph98rEYuXU73ureqrAl/vR4NFloXBQ3U9DnoiYegOrJQUX1IuM8ACIuTH9SiJV\n" +
      "lCfg4pl0i6njoCCIuInzxgGXb01jVTQjx3jTVwgfAoGAfqlWHvVj5ByFtuLhXl1x\n" +
      "WenP8W0O8JCVRg/xR0fF9+IzkpNilYipm3zikDXNNGMEoXolPMAiN6Y9P9uMZczi\n" +
      "FrCLfA22okyj0wSnKYAifHYHmRYJHpyZcTM4VCuMWaQtnGQF43Y1mqGrLUtFqHyf\n" +
      "KtC448dz5F2JHsURJ+XYS2sCgYAfaaJxEq2G75NfcStPprSoMj5TtYKsp2ZsNcKa\n" +
      "6Mop6fXQ6+Ka95PZ5r59XsIrvVPN6GC+VHvw48XL9B1akDjU9Uj0zqlZSWyFh7PK\n" +
      "7RDc3WEVgrBohL9k1eBNtTWur/QiQuT1AWWmT7hKGw7vD5Q54KmfRny06JRXh+mz\n" +
      "EU34cQKBgQCjqsKMWI92BNYHvJG2oVxJT/vxA4bB+1fmfEIQsFEo66H4/6uiQI1r\n" +
      "PZLea6NmAwZZE+dNU/EC9wVhexzqVU14J5gccBKilP9+a22QN1ES4MaOkTKlgffM\n" +
      "aYGCT7Q+yV3Yju9dZ3hAyVZxdGQSL0Q1sVr/kleaUacw1ztKBeHCgQ==\n" +
      "-----END RSA PRIVATE KEY-----",
  },
};
