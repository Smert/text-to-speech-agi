const tts = require('google-translate-tts');
const fs = require('fs').promise;

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
    const buffer = await this._tts.synthesize({
      text,
      voice: 'ru-RU'
    });

    await this._fs.writeFile(outputFilepath, buffer);
  }
}

module.exports = ReserveTextToMP3;
