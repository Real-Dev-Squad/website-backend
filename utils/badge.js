function convertFirebaseTimestampToDateTime(createdAt) {
  const { _seconds, _nanoseconds } = createdAt;
  if (!_seconds || !_nanoseconds) throw new Error("Timestamp does not exist.");
  const serverTimestampDateTime = new Date(_seconds * 1000 + _nanoseconds / 1000000);
  const date = serverTimestampDateTime.toDateString();
  const time = serverTimestampDateTime.toTimeString();
  return {
    date,
    time,
  };
}

module.exports = {
  convertFirebaseTimestampToDateTime,
};
