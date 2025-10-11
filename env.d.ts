// Env variables type definitions

namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    OFFLINE_TICKET_NEON_DATABASE_URL: string;
    ONLINE_TICKET_NEON_DATABASE_URL: string;
    OAUTH_GOOGLE_CLIENT_SECRET: string;
    OAUTH_GOOGLE_CLIENT_ID: string;
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
    MAIN_R2_BUCKET_NAME: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    MAIN_R2_BUCKET_ACCESS_KEY_ID: string;
    MAIN_R2_BUCKET_SECRET_ACCESS_KEY: string;
    MAIN_R2_BUCKET_PUBLIC_URL: string;
    GMAIL_USER: string;
    GMAIL_PASS: string;
  }
}
