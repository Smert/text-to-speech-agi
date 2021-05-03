const AdvancedTextToMP3 = require('./AdvancedTextToMP3');
const ReserveTextToMP3 = require('./ReserveTextToMP3');
const MP3ToWAV = require('./MP3ToWAV');
const path = require('path');

const RESERVED_FILE_PREFIX = '!reserved~';

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

    let filepath;
    try {
      console.log('Create MP3 using Google Text-To-Speech API');
      filepath = await this._createMP3(text);
    } catch (error) {
      console.error(error);
      console.log('Create WAV using Google Translate API');
      filepath = await this._createReserveMP3(text);
    }

    console.log('Convert MP3 to WAV', filepath);
    await this._mp3ToWAV.convert(filepath + '.mp3', filepath + '.wav');

    console.log('Stream file');
    await this._context.streamFile(filepath, '#');

    console.log('Finish');
    await this._context.end();
  }

  async _createMP3(text) {
    const filepath = path.join(this._recordsDir, text.replace(/[\/\\"']/g, '--'));
    await this._advancedTextToMP3.convert(text, filepath + '.mp3');
    return filepath;
  }

  async _createReserveMP3(text) {
    const filepath = path.join(this._recordsDir, RESERVED_FILE_PREFIX + text.replace(/[\/\\"']/g, '--'));
    await this._reserveTextToMP3.convert(text, filepath + '.mp3');
    return filepath;
  }
}

module.exports = Handler;
