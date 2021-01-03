const redis = require('redis')
const { promisify } = require('util')
const redisHost = 'redis-17408.c73.us-east-1-2.ec2.cloud.redislabs.com'
const redisPort = 17408
const redisAuth = 'WsCSxR5rpxC2r2j9avn2UwfmNWJnZhVZ'
const client = redis.createClient({
  port: redisPort,
  host: redisHost
})

client.auth(redisAuth, function (err, response) {
  if (err) {
    throw err
  }
})

const getCache = promisify(client.get).bind(client)
const setCache = promisify(client.set).bind(client)

module.exports = {
  getCache,
  setCache
}
