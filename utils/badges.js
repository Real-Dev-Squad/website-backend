/**
 * Convert firebase timestamp to locale date and time
 * @param  createdAt: firebase timestamp
 * @return {Promise<{date: string, time: string}}|Object>}
 */
function convertFirebaseTimestampToDateTime(createdAt) {
  const { _seconds, _nanoseconds } = createdAt;
  if (!_seconds || !_nanoseconds) throw new Error("Timestamp does not exist.");
  const serverTimestampDateTime = new Date(_seconds * 1000 + _nanoseconds / 1000000);
  const date = serverTimestampDateTime.toLocaleDateString();
  const time = serverTimestampDateTime.toLocaleTimeString();
  return {
    date,
    time,
  };
}

/**
 * Convert firebase document to badge document type
 * @param  id: firebase document id
 * @param  data: firebasee document fields
 * @return {Promise<{id: string, name: string, description: string, imageUrl: string, createdBy: string, createdAt: {date: string, time: string}}|Object>}
 */
function convertFirebaseDocumentToBadgeDocument(id, data) {
  const { createdAt, createdBy, name, description, imageUrl } = data;
  const { date, time } = convertFirebaseTimestampToDateTime(createdAt);
  return {
    id,
    name,
    description,
    imageUrl,
    createdBy,
    createdAt: {
      date,
      time,
    },
  };
}

module.exports = {
  convertFirebaseDocumentToBadgeDocument,
};
