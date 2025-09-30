const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

client.on('error', (err) => console.error('Redis error', err));

async function connectRedis() {
    if (!client.isOpen) await client.connect();
    console.log('✅ Redis connected');
}

module.exports = { client, connectRedis };
