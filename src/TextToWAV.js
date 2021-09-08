const crypto = require('crypto');
const path = require('path');
const isFileExists = require('./utils/isFileExists');
const retry = require('./utils/retry');
const TextToMP3 = require('./TextToMP3');
const MP3ToWAV = require('./MP3ToWAV');

const TEXT_TO_SPEECH_RETRY = 3;

class TextToWAV {
  constructor(recordsDir, _isFileExists, textToMP3, mp3ToWAV, debug = false) {
    this._recordsDir = recordsDir;
    this._isFileExists = _isFileExists;
    this._textToMP3 = textToMP3;
    this._mp3ToWAV = mp3ToWAV;
    this._debug = debug;
  }

  static create(recordsDir, debug) {
    return new TextToWAV(
      recordsDir,
      isFileExists,
      TextToMP3.create(),
      MP3ToWAV.create(),
      debug
    );
  }

  async convert(text, voiceName, speakingRate) {
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const filepath = path.join(this._recordsDir, hash);
    const wavExists = await this._isFileExists(filepath + '.wav');

    if (!wavExists && !await this._isFileExists(filepath + '.mp3')) {
      this._log('Create MP3 using Google Text-To-Speech API');
      await retry(async () => {
        return await this._textToMP3.convert(text, filepath + '.mp3', voiceName, speakingRate);
      }, TEXT_TO_SPEECH_RETRY);
    }

    if (!wavExists) {
      this._log('Convert MP3 to WAV', filepath);
      await this._mp3ToWAV.convert(filepath + '.mp3', filepath + '.wav');
    } else {
      this._log(`File ${filepath}.wav exists`);
    }

    return {
      filepath,
      file: filepath + '.wav'
    };
  }

  _log(...args) {
    if (this._debug) {
      console.log(...args);
    }
  }
}

module.exports = TextToWAV;
