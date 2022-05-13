require("dotenv").config();
const redis = require('redis');

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PWD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.connect();
redisClient.ready = false;

redisClient.on('ready', () => {
    redisClient.ready = true;
    console.log('Redis is ready');
});

redisClient.on('error', (err) => {
    redisClient.ready = false;
    console.log('Error in Redis', err);
});

redisClient.on('end', () => {
    redisClient.ready = false;
    console.log('Redis is disconnected');
});


module.exports = redisClient