const origins = new Set<string>();

const authUrl = process.env.BETTER_AUTH_URL;
if (authUrl) origins.add(authUrl);

// Railway provides this env var with just the hostname (no protocol)
const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
if (railwayDomain) origins.add(`https://${railwayDomain}`);

// Local dev
origins.add("http://localhost:3000");
origins.add("http://localhost:3100");

export const allowedOrigins = [...origins];
