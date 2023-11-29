const DOCUMENT_WRITE_SIZE = 500;

const HEADERS_FOR_SSE = {
  "Content-Type": "text/event-stream",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
};
module.exports = {
  DOCUMENT_WRITE_SIZE,
  HEADERS_FOR_SSE,
};
