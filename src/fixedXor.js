module.exports = (buffer1, buffer2) => buffer1.map((c, i) => c ^ buffer2[i]);
