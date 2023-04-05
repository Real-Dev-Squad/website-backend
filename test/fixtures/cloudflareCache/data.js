const cacheLogs = [
  {
    timestamp: {
      _seconds: 1657193216,
      _nanoseconds: 912000000,
    },
    type: "CLOUDFLARE_CACHE_PURGED",
    meta: {
      userId: "TEST_USER_ID",
    },
    body: {
      message: "Log",
    },
  },
];

const cacheModelData = [
  {
    timestamp: { _seconds: 1659870503, _nanoseconds: 482000000 },
  },
  {
    timestamp: { _seconds: 1659843503, _nanoseconds: 680003000 },
  },
];

const purgeCacheResponse = [
  {
    data: {
      success: true,
      errors: [],
      messages: [],
      result: {
        id: "TEST_RESULT_ID",
      },
    },
  },
];

module.exports = {
  cacheLogs,
  cacheModelData,
  purgeCacheResponse,
};
