const GoogleTTS = require('node-google-tts-api');
const fs = require('fs').promises;

const tts = new GoogleTTS();

class ReserveTextToMP3 {
  constructor(_tts, _fs) {
    this._tts = tts;
    this._fs = _fs;
  }

  static create() {
    return new ReserveTextToMP3(
      tts,
      fs
    );
  }

  async convert(text, outputFilepath) {
    const buffer = await this._tts.get({
      text,
      lang: 'ru'
    });
    await this._fs.writeFile(outputFilepath, buffer);
  }
}

module.exports = ReserveTextToMP3;
