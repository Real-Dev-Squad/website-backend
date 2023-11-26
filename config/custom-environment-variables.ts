import { CloudflareConfig, CloudinaryConfig, CorsConfig, Event100msConfig, FirestoreConfig, GithubOauth, IntegrationsConfig, RdsServerlessBotConfig, RoutesCacheTTLConfig, githubApiList, } from "./types/index";

interface UserTokenConfig {
  cookieName: string;
  ttl: ConfigObject<number>;
  refreshTtl: ConfigObject<number>;
  publicKey: string;
  privateKey: string;
}

interface CustomServices {
  rdsApi: {
    baseUrl: string;
  };
  rdsUi: {
    baseUrl: string;
    routes: {
      authRedirection: string;
    };
  };
  goalAPI: {
    baseUrl: string;
    secretKey: string;
  };
  discordBot: {
    baseUrl: string;
  };
}

interface CustomBotToken {  
  botPublicKey: string;
}

interface Config {
  [key: string]: 
    | string 
    | number 
    | boolean 
    | ConfigObject
    | githubApiList
    | GithubOauth
    | FirestoreConfig
    | CustomServices
    | CustomBotToken
    | CorsConfig
    | UserTokenConfig
    | CloudinaryConfig
    | CloudflareConfig
    | RdsServerlessBotConfig
    | IntegrationsConfig
    | RoutesCacheTTLConfig
    | Event100msConfig;

  port: portConfig;
  enableFileLogs: ConfigObject<string>;
  enableConsoleLogs: ConfigObject<string>;
  githubApi: githubApiList;
  githubOauth: GithubOauth;
  githubAccessToken: string;
  firestore: string;
  services: CustomServices;
  userToken: UserTokenConfig;
  botToken: CustomBotToken;
  rdsServerlessBot: RdsServerlessBotConfig;
  cloudinary: CloudinaryConfig;
  integrations: IntegrationsConfig;
  routesCacheTTL: RoutesCacheTTLConfig;
  Event100ms: {
    APP_ACCESS_KEY: string;
    APP_SECRET: string;
  };
}

interface portConfig {
  __name: string;
  __format: "number";
}

interface ConfigObject<T = string> {
  __name: string;
  __format: T | "number";
}

const config: Config = {
  port: {
    __name: "PORT",
    __format: "number",
  },
  enableFileLogs: {
    __name: "ENABLE_FILE_LOGS",
    __format: "boolean",
  },
  enableConsoleLogs: {
    __name: "ENABLE_CONSOLE_LOGS",
    __format: "boolean",
  },
  githubApi: {
    baseUrl: "GITHUB_API_BASE_URL",
    org: "GITHUB_ORGANISATION",
  },
  githubOauth: {
    clientId: "GITHUB_CLIENT_ID",
    clientSecret: "GITHUB_CLIENT_SECRET",
  },
  githubAccessToken: "GITHUB_PERSONAL_ACCESS_TOKEN",
  firestore: "FIRESTORE_CONFIG",
  services: {
    rdsApi: {
      baseUrl: "SERVICES_RDSAPI_BASEURL",
    },
    rdsUi: {
      baseUrl: "SERVICES_RDSUI_BASEURL",
      routes: {
        authRedirection: "SERVICES_RDSUI_ROUTES_AUTH_REDIRECTION",
      },
    },
    goalAPI: {
      baseUrl: "GOALS_BASE_URL",
      secretKey: "GOALS_SECRET_KEY",
    },
    discordBot: {
      baseUrl: "DISCORD_BASE_URL",
    },
  },
  userToken: {
    cookieName: "COOKIE_NAME",
    ttl: {
      __name: "USER_TOKEN_TTL",
      __format: "number",
    },
    refreshTtl: {
      __name: "USER_TOKEN_REFRESH_TTL",
      __format: "number",
    },
    publicKey: "PUBLIC_KEY",
    privateKey: "PRIVATE_KEY",
  },
  botToken: {
    botPublicKey: "BOT_PUBLIC_KEY",
  },
  rdsServerlessBot: {
    rdsServerLessPrivateKey: "RDS_SERVERLESS_PRIVATE_KEY",
    ttl: "RDS_SERVERLESS_TTL",
  },
  cloudinary: {
    cloud_name: "CLOUDINARY_CLOUD_NAME",
    api_key: "CLOUDINARY_API_KEY",
    api_secret: "CLOUDINARY_API_SECRET_KEY",
  },
  integrations: {
    newrelic: {
      appName: "INTEGRATIONS_NEWRELIC_APPNAME",
      licenseKey: "INTEGRATIONS_NEWRELIC_LICENSEKEY",
    },
  },
  routesCacheTTL: {
    "/members": "ROUTESCACHETTL_MEMBERS",
  },
  Event100ms: {
    APP_ACCESS_KEY: "EVENT_100MS_APP_ACCESS_KEY",
    APP_SECRET: "EVENT_100MS_APP_SECRET",
  },
};

export default config;