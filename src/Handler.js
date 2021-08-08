const TextToWAV = require('./TextToWAV');
const wavFileInfo = require('wav-file-info');

const RESULT_VAR = 'TEXT_TO_SPEECH_RESULT';
const FILENAME_VAR = 'TEXT_TO_SPEECH_FILENAME';
const DURATION_VAR = 'TEXT_TO_SPEECH_DURATION';

class Handler {
  constructor(context, textToWAV, voiceName, _getAudioDurationInSeconds) {
    this._context = context;
    this._textToWAV = textToWAV;
    this._voiceName = voiceName;
    this._getAudioDurationInSeconds = _getAudioDurationInSeconds;
  }

  static create(context, recordsDir, voiceName) {
    return new Handler(
      context,
      TextToWAV.create(recordsDir, true),
      voiceName,
      (filepath) => {
        return new Promise((resolve, reject) => {
          wavFileInfo.infoByFilename(filepath, (error, info) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(Number(info.duration));
          });
        });
      }
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

      const {filepath, file} = await this._textToWAV.convert(text, this._voiceName);
      const duration = await this._getAudioDurationInSeconds(file);

      console.log(`Set variable ${DURATION_VAR}=${duration}`);
      await this._context.setVariable(DURATION_VAR, duration);

      console.log(`Set variable ${FILENAME_VAR}=${filepath}`);
      await this._context.setVariable(FILENAME_VAR, filepath);

      console.log(`Set variable ${RESULT_VAR}=SUCCESS`);
      await this._context.setVariable(RESULT_VAR, 'SUCCESS');
    }

    console.log('Finish');
    await this._context.end();
  }
}

module.exports = Handler;
