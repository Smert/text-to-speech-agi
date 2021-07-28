const TextToWAV = require('./TextToWAV');

const RESULT_VAR = 'TEXT_TO_SPEECH_RESULT';

class Handler {
  constructor(context, textToWAV, voiceName) {
    this._context = context;
    this._textToWAV = textToWAV;
    this._voiceName = voiceName;
  }

  static create(context, recordsDir, voiceName) {
    return new Handler(
      context,
      TextToWAV.create(recordsDir, true),
      voiceName
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

      const {filepath} = await this._textToWAV.convert(text, this._voiceName);

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
