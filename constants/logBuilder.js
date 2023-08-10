function updateTaskMessageLogger(username, keys, values, timestamp) {
  if (keys.length > 1) {
    keys = keys.join(", ");
  } else if (values.length > 1) {
    values = values.join(", ");
  }

  return `@${username} updated ${keys} to ${values} at #${timestamp}`;
}

module.exports = { updateTaskMessageLogger };
