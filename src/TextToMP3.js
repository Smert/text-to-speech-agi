const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
const {promises: fs} = require('fs');

class TextToMP3 {
  constructor(textToSpeechClient, _fs, voiceName) {
    this._textToSpeechClient = textToSpeechClient;
    this._fs = _fs;
    this._voiceName = voiceName;
  }

  static create(voiceName) {
    const textToSpeechClient = new TextToSpeechClient({
      keyFilename: 'key.json'
    });
    return new TextToMP3(
      textToSpeechClient,
      fs,
      voiceName
    );
  }

  async convert(text, outputFilepath) {
    const [response] = await this._textToSpeechClient.synthesizeSpeech({
      input: {text},
      voice: {
        languageCode: 'ru-RU',
        name: this._voiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.07
      },
    });
    await this._fs.writeFile(outputFilepath, response.audioContent, 'binary');
  }
}

module.exports = TextToMP3;
