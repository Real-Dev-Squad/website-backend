/**
 * Set the environment specific config in this file.
 * Defaults set from default.js
 */

const port = 7337;
const NODE_ENV = process.env.NODE_ENV;
module.exports = {
  port,
  enableFileLogs: false,
  // Console logs are set to avoid the winston error of no defined transports
  enableConsoleLogs: true,
  discordUnverifiedRoleId: "1234567890",
  discordDeveloperRoleId: "9876543210",
  discordNewComersChannelId: "709080951824842783",
  discordMavenRoleId: "1212121212",
  discordMissedUpdatesRoleId: "<discordMissedUpdatesRoleId>",
  githubApi: {
    baseUrl: "https://api.github.com",
    org: "Real-Dev-Squad",
  },
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

  emailSubscriptionCredentials: {
    user: "<RDS_EMAIL>",
    pass: "<EMAIL PASSWORD GENERATED AFTER 2FA>",
    host: "<smtp host>",
    port: "<number>",
  },
  services: {
    rdsApi: {
      baseUrl: `http://localhost:${port}`,
    },
    rdsUi: {
      baseUrl: "https://realdevsquad.com",
      routes: {
        authRedirection: "/goto",
      },
      goalAPI: {
        baseUrl: "<goalBaseUrl>",
        secretKey: "<goalSecretKey>",
        cookieName: `goals-session-test`,
      },
    },
    discordBot: {
      baseUrl: "DISCORD_BASE_URL",
    },
    goalAPI: {
      baseUrl: "<goalBaseUrl>",
      secretKey: "<goalSecretKey>",
      cookieName: `goals-session-test`,
    },
  },

  cors: {
    allowedOrigins: /(https:\/\/([a-zA-Z0-9-_]+\.)?realdevsquad\.com$)|(localhost)/, // Allow realdevsquad.com, *.realdevsquad.com and localhost for non-production envs
  },

  userToken: {
    cookieName: `rds-session-${NODE_ENV}`,
    cookieV2Name: `rds-session-v2-${NODE_ENV}`,
    ttl: 30 * 24 * 60 * 60, // in seconds
    refreshTtl: 180 * 24 * 60 * 60, // in seconds
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
    botPrivateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIIEoQIBAAKCAQBK3CkprcpAYxme7vtdjpWOgFFjoYsqU3OmhMEty/s1gnW5tgbK\n" +
      "4ief4xk+cU+mu3YvjzWudT/SV17tAWxL4Y+GincJwL5gpQwlnw9qOAdRGkpBriQL\n" +
      "ec7kNVIydZXbUitziy+iSimxNzdDmjvlK9ZGmiVLZm+MePbUtgaIpfgd+4bRWzud\n" +
      "lITiNmWY7HppLzyBw+037iEICM4kwPPFI+SOGJhpAAmD6vk0MeZk1NeQmyQp/uOP\n" +
      "pWmVRzgyK+XVc6AwZHV+/n6xAIT91/DjJlD1N+nS7Sqo3RJ04+KlNRUclzINOC7J\n" +
      "BYkKtG7YQ0U9nNLkRrRlON+O6tY4OT86T1O1AgMBAAECggEAAhInHV0ObEuRiOEJ\n" +
      "mSP5pTCNj9kHNYuLdn7TrUWoVGmgghu0AmbRO84Xg6+0yWMEOPqYPJRHyLTcDmhs\n" +
      "q4i45Lrt4hov6hKGzH+i+IhGQ4sbpMeBfcPH4m5LMNQp6iBSzWZ7Ud0FXD6vy7H3\n" +
      "mDZnPhrDj1ttGJC8G1RRx/P3cjTccU3lsae6wNjkXaSveWGgPS3m0x95eOPPwa2C\n" +
      "KvVLx+kYr2r0uLF5vHN6H9uWqUTWo1GVX3nO+obapYbtcIqCbGQI4eTkvgq0qG7J\n" +
      "Nh5IwYJz0bzYFfSQSRwRz9JaCzFRiP55aZnJgk2um5JdbxYCHpw5E1NV/7OsPXlE\n" +
      "e4vGHQKBgQCSD/ZQu/1TeyqBF8RRdl9YtOhVAFJDiHTPFNNz9V8eak+x6hFOOGOf\n" +
      "QHnbg0X4meYuilaBwXiEsSswPuVAW87VnRHrR2yyyC8knCMcvii3g9q+ed0+ri2+\n" +
      "cslDPaDkcvl98qoZEfv/lk7BA7jPFToLMNfNdoHrZXVezZxetVbsuwKBgQCDNJFB\n" +
      "XDxXlkIVkT8ozD/qvyQsDXz/wlOob6AkY0J7IdND5jPCi799Q1O1H7pJu50cAi+O\n" +
      "ar5EuFxA8TfTKJnIVJBZFrN0O1un86WhCvB8PjgguxqtmJlEPVveiZXnTTfvXVeq\n" +
      "G6+3eU/yRw9VDX61iidbWNc+SbMJ9sFQPKNyTwKBgFoaFqx/CyqwU+wGqUhHaVHj\n" +
      "Z17oL9cRGl2UT0y9FMxCcJ8j8UD7cBkRQRq0xDkzVtdm5y5sFthkImxEoE8vU0xa\n" +
      "9G7bRKaU7t/6oX5dn+h1Ij9WFbFQ6U8OqDEel13Vvyp+w4drnLRyGGrgzOSSB5hX\n" +
      "rQhGDqcTk2/EDq4t1015AoGAWDnv9vhz5x22AFS0GNYHoO25ABpt1Hmy0Y+GKxHH\n" +
      "8Y6URpM0ePyJ3kx4rFHSbaRICD58BhNHMGScPFs4A7jIeApNKmr2bxE/F9fhp0H4\n" +
      "5kLccT3/uX3kihuMfD8eWvP0yfOFcHC/nutnU+5uo+24J5Dn2CgMTOk4CFoyMack\n" +
      "7UcCgYBHdbFcXWGHfEqLJZChRrKhWLxn9jkJ0apvnO1j6c5yiAo3yJkSV5Z9IdAc\n" +
      "lgOC/dJBTZLcBtixdERqcJ+o4P7oFRS6hz/9n4s+kkzxXVqEmtJmBQvHUo3I/Qgc\n" +
      "Ba+XMCP64pXPC3r1llhKRwIl+6UFn+QlpbxtgQjhbULnSbc7fw==\n" +
      "-----END RSA PRIVATE KEY-----",
  },

  rdsServerlessBot: {
    rdsServerLessPublicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBK3CkprcpAYxme7vtdjpWO\n" +
      "gFFjoYsqU3OmhMEty/s1gnW5tgbK4ief4xk+cU+mu3YvjzWudT/SV17tAWxL4Y+G\n" +
      "incJwL5gpQwlnw9qOAdRGkpBriQLec7kNVIydZXbUitziy+iSimxNzdDmjvlK9ZG\n" +
      "miVLZm+MePbUtgaIpfgd+4bRWzudlITiNmWY7HppLzyBw+037iEICM4kwPPFI+SO\n" +
      "GJhpAAmD6vk0MeZk1NeQmyQp/uOPpWmVRzgyK+XVc6AwZHV+/n6xAIT91/DjJlD1\n" +
      "N+nS7Sqo3RJ04+KlNRUclzINOC7JBYkKtG7YQ0U9nNLkRrRlON+O6tY4OT86T1O1\n" +
      "AgMBAAE=\n" +
      "-----END PUBLIC KEY-----",
    rdsServerLessPrivateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIIEoQIBAAKCAQBK3CkprcpAYxme7vtdjpWOgFFjoYsqU3OmhMEty/s1gnW5tgbK\n" +
      "4ief4xk+cU+mu3YvjzWudT/SV17tAWxL4Y+GincJwL5gpQwlnw9qOAdRGkpBriQL\n" +
      "ec7kNVIydZXbUitziy+iSimxNzdDmjvlK9ZGmiVLZm+MePbUtgaIpfgd+4bRWzud\n" +
      "lITiNmWY7HppLzyBw+037iEICM4kwPPFI+SOGJhpAAmD6vk0MeZk1NeQmyQp/uOP\n" +
      "pWmVRzgyK+XVc6AwZHV+/n6xAIT91/DjJlD1N+nS7Sqo3RJ04+KlNRUclzINOC7J\n" +
      "BYkKtG7YQ0U9nNLkRrRlON+O6tY4OT86T1O1AgMBAAECggEAAhInHV0ObEuRiOEJ\n" +
      "mSP5pTCNj9kHNYuLdn7TrUWoVGmgghu0AmbRO84Xg6+0yWMEOPqYPJRHyLTcDmhs\n" +
      "q4i45Lrt4hov6hKGzH+i+IhGQ4sbpMeBfcPH4m5LMNQp6iBSzWZ7Ud0FXD6vy7H3\n" +
      "mDZnPhrDj1ttGJC8G1RRx/P3cjTccU3lsae6wNjkXaSveWGgPS3m0x95eOPPwa2C\n" +
      "KvVLx+kYr2r0uLF5vHN6H9uWqUTWo1GVX3nO+obapYbtcIqCbGQI4eTkvgq0qG7J\n" +
      "Nh5IwYJz0bzYFfSQSRwRz9JaCzFRiP55aZnJgk2um5JdbxYCHpw5E1NV/7OsPXlE\n" +
      "e4vGHQKBgQCSD/ZQu/1TeyqBF8RRdl9YtOhVAFJDiHTPFNNz9V8eak+x6hFOOGOf\n" +
      "QHnbg0X4meYuilaBwXiEsSswPuVAW87VnRHrR2yyyC8knCMcvii3g9q+ed0+ri2+\n" +
      "cslDPaDkcvl98qoZEfv/lk7BA7jPFToLMNfNdoHrZXVezZxetVbsuwKBgQCDNJFB\n" +
      "XDxXlkIVkT8ozD/qvyQsDXz/wlOob6AkY0J7IdND5jPCi799Q1O1H7pJu50cAi+O\n" +
      "ar5EuFxA8TfTKJnIVJBZFrN0O1un86WhCvB8PjgguxqtmJlEPVveiZXnTTfvXVeq\n" +
      "G6+3eU/yRw9VDX61iidbWNc+SbMJ9sFQPKNyTwKBgFoaFqx/CyqwU+wGqUhHaVHj\n" +
      "Z17oL9cRGl2UT0y9FMxCcJ8j8UD7cBkRQRq0xDkzVtdm5y5sFthkImxEoE8vU0xa\n" +
      "9G7bRKaU7t/6oX5dn+h1Ij9WFbFQ6U8OqDEel13Vvyp+w4drnLRyGGrgzOSSB5hX\n" +
      "rQhGDqcTk2/EDq4t1015AoGAWDnv9vhz5x22AFS0GNYHoO25ABpt1Hmy0Y+GKxHH\n" +
      "8Y6URpM0ePyJ3kx4rFHSbaRICD58BhNHMGScPFs4A7jIeApNKmr2bxE/F9fhp0H4\n" +
      "5kLccT3/uX3kihuMfD8eWvP0yfOFcHC/nutnU+5uo+24J5Dn2CgMTOk4CFoyMack\n" +
      "7UcCgYBHdbFcXWGHfEqLJZChRrKhWLxn9jkJ0apvnO1j6c5yiAo3yJkSV5Z9IdAc\n" +
      "lgOC/dJBTZLcBtixdERqcJ+o4P7oFRS6hz/9n4s+kkzxXVqEmtJmBQvHUo3I/Qgc\n" +
      "Ba+XMCP64pXPC3r1llhKRwIl+6UFn+QlpbxtgQjhbULnSbc7fw==\n" +
      "-----END RSA PRIVATE KEY-----",
    ttl: 60,
  },

  cronJobHandler: {
    privateKey:
      "-----BEGIN RSA PRIVATE KEY-----\n" +
      "MIIEowIBAAKCAQEAqjkUS3EGyuh64eITS/n5MX7G4z5MIv99DNqZezqCSRD/QIXO\n" +
      "1QtDrj/OKAB5a+4GAJSxIO8HgRFocdiKauxako3UagNSabiI+/H5zXjtnbPKwMBd\n" +
      "CoJ3r1+OzyMT4zL+SVlIMHkxYbRgMYJvNTyie/rIpjcpQhaBJxyBkaT2Imy9luGC\n" +
      "Rhd5wupx9+rhd8xOYu+hqSWfP4zIcEGCs86OXFFmNp6sqcQD1P15HkJtleodzcKg\n" +
      "msqo8RTk8t+urdWIdoLFAugwqFE9jor8UxApwT5xr8c84VDfbPgc10V2XTda4SXa\n" +
      "IRP7QY+9agGmZIYp0LWxUOhB37PNFDhUEw9dVwIDAQABAoIBAH9rJJ7oJz6B0WH+\n" +
      "WZV4s6jyDiySOGnGNzQE+fh9LoNFHtyMjOt6eBoaFtZorHs2+/U5WHGfm01o23bE\n" +
      "sbAh5hZn5kXI4MrUYG2/js7Yo3111OJ92+d/C9oRvJOe3Ucnp6L+GwR145oQbCUD\n" +
      "Tv1ZuwL1EXciOVcIA3tkYjTEd54B8UTfEMpRMdlkPohYL96kizqbe6peG9hlLMXS\n" +
      "AeVr2y0ueDR+fYte6TmejpfxnD16/PksMGH5ALHQ6AonCngvDO3mnGLaFuwHkRnY\n" +
      "1vMkni+6J57MQz+GAWI7p1EKbEzl9Z+1a6NDxALabVxYuQFc5pa7wXr97/9SAC5x\n" +
      "NvZ/EekCgYEA1CcCDXhi6ztK+BhnYCKZKR9GxP9CReNm9FVIB4cVGKduCuaJrcGk\n" +
      "qKPSGkaMaJat23WDxr9GUhR1IThK+/dLg+Ud9GPvWN710LT+Wm9cuwuyPbyAet8J\n" +
      "2G+IKbCsr62okI/XVBnfPrGA2tQZRMgia7lEz/ZKx/7oOpN/FyPpG+UCgYEAzWeV\n" +
      "k12md1YIJcPHfVofsnqpy22PIhLJgN3LgM2aubPQoYg1LBwBwRWLU16zNLFhbsyx\n" +
      "leMA3OsyLFzw7NmsCpXE7SB1nH0xFmTi/ONqiN4Hx0w+72kG3LLcVWDwqGF3zj+x\n" +
      "v/75dYgWW1SeofwgkkDnmnqMuESnprojyRzk2IsCgYAb3lftrw/HeM17U7FYtpLK\n" +
      "DRq9zA5HofynQgCpRHxn9a6F7gzN728S3BpAa14MaybBemlqFTxGkftk9sEa4jxg\n" +
      "QhuyO+J4GSnPVcdH1/Mlev7aD0YNXfksHlKTr2qv1S8cdljB6ngiAy07EbuUBnpH\n" +
      "DlpUuzTNmtWkxDVgs83uZQKBgQCbo+Cv4Gdxx2u3CelQL4kTGWUtct/hJrEvB2Db\n" +
      "QW/7RKhSrb30pWgi4WtICdrqk3nLlij99RtDSqgi+23HWozFHIUyVMUphac7W8iv\n" +
      "bLbd7LeiKUEK8d80Pgc8Xo8cV3aLfrH2VIK7rxmZrL3i6gPYLnwQDsowGj2a1TKm\n" +
      "glFZTwKBgDr/Lf4P8V7s+RyIKea0AKMM9xAqbvZRdKFFNTq5SXUtVFi130F3ozHV\n" +
      "o6x/R8X3QuyNeyZ8SI7eKJ+oo1jF97WgRWBiE66IHGziUZc4+gFAmHzdeZft0xtJ\n" +
      "AIvluPVA3HOHFj4US3LMxbxDsPr+gkTpkVGIfK0rk8Za3dN3mZJw\n" +
      "-----END RSA PRIVATE KEY-----",
    publicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqjkUS3EGyuh64eITS/n5\n" +
      "MX7G4z5MIv99DNqZezqCSRD/QIXO1QtDrj/OKAB5a+4GAJSxIO8HgRFocdiKauxa\n" +
      "ko3UagNSabiI+/H5zXjtnbPKwMBdCoJ3r1+OzyMT4zL+SVlIMHkxYbRgMYJvNTyi\n" +
      "e/rIpjcpQhaBJxyBkaT2Imy9luGCRhd5wupx9+rhd8xOYu+hqSWfP4zIcEGCs86O\n" +
      "XFFmNp6sqcQD1P15HkJtleodzcKgmsqo8RTk8t+urdWIdoLFAugwqFE9jor8UxAp\n" +
      "wT5xr8c84VDfbPgc10V2XTda4SXaIRP7QY+9agGmZIYp0LWxUOhB37PNFDhUEw9d\n" +
      "VwIDAQAB\n" +
      "-----END PUBLIC KEY-----",
  },

  // Cloudinary keys
  cloudinary: {
    cloud_name: "Cloud_name",
    api_key: "API_KEY",
    api_secret: "api_secret_key",
  },

  // Cloudflare
  cloudflare: {
    CLOUDFLARE_ZONE_ID: "Cloudflare_Zone_ID_or_ID",
    CLOUDFLARE_X_AUTH_KEY: "Cloudflare_API_Auth_Key",
    CLOUDFLARE_X_AUTH_EMAIL: "Cloudflare_User_Email",
  },

  integrations: {
    newrelic: {
      appName: "RDS_API_production",
      licenseKey: "<newrelicLicenseKey>",
    },
  },

  routesCacheTTL: {
    "/members": 900,
  },

  githubAccessToken: "GITHUB_PERSONAL_ACCESS_TOKEN",

  Event100ms: {
    APP_ACCESS_KEY: "EVENT_100MS_APP_ACCESS_KEY",
    APP_SECRET: "EVENT_100MS_APP_SECRET",
  },

  externalServices: {
    EXTERNAL_SERVICE_PUBLIC_KEY: "EXTERNAL_SERVICE_PUBLIC_KEY",
  },
};
