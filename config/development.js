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
    publicKey:
      "-----BEGIN PUBLIC KEY-----\n" +
      "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBK3CkprcpAYxme7vtdjpWO\n" +
      "gFFjoYsqU3OmhMEty/s1gnW5tgbK4ief4xk+cU+mu3YvjzWudT/SV17tAWxL4Y+G\n" +
      "incJwL5gpQwlnw9qOAdRGkpBriQLec7kNVIydZXbUitziy+iSimxNzdDmjvlK9ZG\n" +
      "miVLZm+MePbUtgaIpfgd+4bRWzudlITiNmWY7HppLzyBw+037iEICM4kwPPFI+SO\n" +
      "GJhpAAmD6vk0MeZk1NeQmyQp/uOPpWmVRzgyK+XVc6AwZHV+/n6xAIT91/DjJlD1\n" +
      "N+nS7Sqo3RJ04+KlNRUclzINOC7JBYkKtG7YQ0U9nNLkRrRlON+O6tY4OT86T1O1\n" +
      "AgMBAAE=\n" +
      "-----END PUBLIC KEY-----",
    privateKey:
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

  integrations: {
    newrelic: {
      appName: "RDS_API_development",
    },
  },
};
