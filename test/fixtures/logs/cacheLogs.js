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

const cacheModelMetaData = [
  {
    docId: "TEST_ID_1",
    timestamp: { _seconds: 1659870503, _nanoseconds: 482000000 },
  },
  {
    docId: "TEST_ID_2",
    timestamp: { _seconds: 1659843503, _nanoseconds: 680003000 },
  },
];

const cacheMetaData = {
  id: "TEST_ID",
  message: "Cache Metadata returned successfully!",
  count: 1,
  timestamp: 1659870503,
};

module.exports = {
  cacheLogs,
  cacheModelMetaData,
  cacheMetaData,
};
