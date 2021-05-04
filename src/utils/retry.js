async function retry(fn, count) {
  for (let i = 0; i < count - 1; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Retry (${i + 1}):`, error);
    }
  }

  return await fn();
}

module.exports = retry;
