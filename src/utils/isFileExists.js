const fs = require('fs').promises;

async function isFileExists(path) {
  try {
    await fs.access(path);
  } catch {
    return false
  }

  return true
}

module.exports = isFileExists;
