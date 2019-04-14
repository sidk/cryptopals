module.exports = (message, key) => {
  const messageBuffer = Buffer.from(message);
  let keyBuffer;
  if (message.length > key.length) {
    keyBuffer = Buffer.from(
      key.repeat((message.length + 1) / key.length).slice(0, message.length)
    );
    return keyBuffer.map((k, i) => k ^ messageBuffer[i]).toString("hex");
  } else {
    keyBuffer = Buffer.from(key);
    return messageBuffer.map((m, i) => m ^ keyBuffer[i]).toString("hex");
  }
};
