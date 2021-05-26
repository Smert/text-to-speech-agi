const TextToMP3 = require('./TextToMP3');
const MP3ToWAV = require('./MP3ToWAV');
const path = require('path');
const retry = require('./utils/retry');
const isFileExists = require('./utils/isFileExists');
const crypto = require('crypto');

const RESULT_VAR = 'TEXT_TO_SPEECH_RESULT';
const TEXT_TO_SPEECH_RETRY = 3;

class Handler {
  constructor(context, textToMP3, mp3ToWAV, recordsDir) {
    this._context = context;
    this._textToMP3 = textToMP3;
    this._mp3ToWAV = mp3ToWAV;
    this._recordsDir = recordsDir;
  }

  static create(context, recordsDir) {
    return new Handler(
      context,
      TextToMP3.create(),
      MP3ToWAV.create(),
      recordsDir
    );
  }

  handle() {
    this._context.onEvent('variables')
      .then((variables) => {
        console.log('Event: variables');
        return this._onStart(variables)
          .catch((error) => {
            console.error('error', error);
            return this._context.end();
          });
      });

    this._context.onEvent('error')
      .then(() => {
        console.log('Event: error');
        return this._context.end();
      });

    this._context.onEvent('close')
      .then(() => {
        console.log('Event: close');
      });

    this._context.onEvent('hangup')
      .then(() => {
        console.log('Event: hangup');
        return this._context.end();
      });
  }

  async _onStart(variables) {
    const text = String(variables.agi_arg_1).trim();
    console.log(`text="${text}"`);

    if (text) {
      console.log(`Set variable ${RESULT_VAR}=FAILED`);
      await this._context.setVariable(RESULT_VAR, 'FAILED');

      console.log('Create MP3 using Google Text-To-Speech API');
      const hash = crypto.createHash('md5').update(text).digest('hex');
      const filepath = path.join(this._recordsDir, hash);
      if (!await isFileExists(filepath + '.wav')) {
        await retry(async () => {
          return await this._textToMP3.convert(text, filepath + '.mp3');
        }, TEXT_TO_SPEECH_RETRY);

        console.log('Convert MP3 to WAV', filepath);
        await this._mp3ToWAV.convert(filepath + '.mp3', filepath + '.wav');
      } else {
        console.log(`File ${filepath}.wav exists`);
      }

      console.log('Stream file');
      await this._context.streamFile(filepath, '#');

      console.log(`Set variable ${RESULT_VAR}=SUCCESS`);
      await this._context.setVariable(RESULT_VAR, 'SUCCESS');
    }

    console.log('Finish');
    await this._context.end();
  }
}

module.exports = Handler;
