import Redis from 'ioredis';

let redis: Redis;

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();
  
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('Redis连接失败，超过最大重试次数');
        return null;
      }
      return Math.min(times * 100, 1000);
    },
  });
  
  redis.on('connect', () => {
    console.log('Redis连接成功');
  });
  
  redis.on('error', (err) => {
    console.error('Redis连接错误:', err);
  });
});

export { redis };
