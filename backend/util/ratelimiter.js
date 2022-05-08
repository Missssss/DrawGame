const redisClient =  require("./redis")

const rateLimit =  async (req, res, next) => {
    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip
    console.log(ip)

    const window = 1;
    const limit = 10;

    let currentCount = await redisClient.incr(ip);
    console.log(currentCount)

    if(currentCount == 1){
        redisClient.expire(ip, window)
    }

    if(currentCount >= limit){
        console.log("block! Too Many Requests");
        res.status(429).json({ "error": "Too Many Requests in one second" })
        return 
    }
    
    return next()
}
// const ip = (req.header["x-forwarded-for"] || req.connection.remoteAddress.replace(/^.*:/, ""));



module.exports = {
    rateLimit,
}