const DOCUMENT_WRITE_SIZE = 500;
const daysOfWeek = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const HEADERS_FOR_SSE = {
  "Content-Type": "text/event-stream",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
};

module.exports = {
  DOCUMENT_WRITE_SIZE,
  daysOfWeek,
  HEADERS_FOR_SSE,
};
