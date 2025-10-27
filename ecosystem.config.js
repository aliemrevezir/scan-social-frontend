module.exports = {
  apps: [
    {
      name: "scansocial-web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "development",
        PORT: 2025,

        // API Configuration
        NEXT_PUBLIC_API_URL: "https://scansocial.site",
        NEXT_PUBLIC_API_BASE_URL: "https://scansocial.site/api/v1",
        NEXT_PUBLIC_APP_URL: "https://scansocial.site",
        NEXT_PUBLIC_DEV_BRAND_EMAIL: "brand@scansocial.dev",
        NEXT_PUBLIC_DEV_BRAND_PASSWORD: "password123",
        NEXT_PUBLIC_DEV_INFLUENCER_EMAIL: "creator@scansocial.dev",
        NEXT_PUBLIC_DEV_INFLUENCER_PASSWORD: "password123",

        // Authentication
        NEXT_PUBLIC_JWT_SECRET: "iFoPena8krPjs9Xb4AkgsX4g1z0CeAWBygAXaZ6Z9tg",

        // Analytics & Monitoring
        NEXT_PUBLIC_GA_ID: "G-XXXXXXXXXX",

        // Feature Flags
        NEXT_PUBLIC_ENABLE_ANALYTICS: true,
        NEXT_PUBLIC_ENABLE_DARK_MODE: true
      }
    }
  ]
};
