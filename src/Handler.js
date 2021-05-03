const AdvancedTextToMP3 = require('./AdvancedTextToMP3');
const ReserveTextToMP3 = require('./ReserveTextToMP3');
const MP3ToWAV = require('./MP3ToWAV');
const path = require('path');

// TODO Retry policy
// TODO Use cache
// TODO Rate limit
class Handler {
  constructor(context, advancedTextToMP3, reserveTextToMP3, mp3ToWAV, recordsDir) {
    this._context = context;
    this._advancedTextToMP3 = advancedTextToMP3;
    this._reserveTextToMP3 = reserveTextToMP3;
    this._mp3ToWAV = mp3ToWAV;
    this._recordsDir = recordsDir;
  }

  static create(context, recordsDir) {
    return new Handler(
      context,
      AdvancedTextToMP3.create(),
      ReserveTextToMP3.create(),
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
    const text = variables.agi_arg_1;
    console.log('text = ', text);

    const filename = text.replace(/\/|\\/g, '--');
    console.log('Create MP3 using Google Text-To-Speech API', filename);
    const mp3Filepath = path.join(this._recordsDir, filename + '.mp3');
    try {
      await this._advancedTextToMP3.convert(text, mp3Filepath);
    } catch (error) {
      console.error(error);
      console.log('Create MP3 using Google Translate API');
      await this._reserveTextToMP3.convert(text, mp3Filepath);
    }

    const wavFilepath = path.join(this._recordsDir, filename + '.wav');
    console.log('Convert MP3 to WAV', wavFilepath);
    await this._mp3ToWAV.convert(mp3Filepath, wavFilepath);

    console.log('Stream file');
    await this._context.streamFile(wavFilepath, '#');

    console.log('Finish');
    await this._context.end();
  }
}

module.exports = Handler;
