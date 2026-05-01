export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [],
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
    },
    
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'no-reply@example.com',
    },
    
    public: {
      apiBase: '/api',
    },
  },
  
  nitro: {
    preset: 'node-server',
    plugins: ['~/server/plugins/redis.ts', '~/server/plugins/prisma.ts'],
  },
  
  compatibilityDate: '2024-01-01',
});
