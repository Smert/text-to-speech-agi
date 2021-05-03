const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
const {promises: fs} = require('fs');

class AdvancedTextToMP3 {
  constructor(textToSpeechClient, _fs) {
    this._textToSpeechClient = textToSpeechClient;
    this._fs = _fs;
  }

  static create() {
    const textToSpeechClient = new TextToSpeechClient({
      keyFilename: 'key.json'
    });
    return new AdvancedTextToMP3(
      textToSpeechClient,
      fs
    );
  }

  async convert(text, outputFilepath) {
    const [response] = await this._textToSpeechClient.synthesizeSpeech({
      input: {text},
      voice: {
        languageCode: 'ru-RU',
        name: 'ru-RU-Wavenet-C'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.07
      },
    });
    await this._fs.writeFile(outputFilepath, response.audioContent, 'binary');
  }
}

module.exports = AdvancedTextToMP3;
