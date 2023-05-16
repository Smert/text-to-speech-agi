const {TextToSpeechClient} = require('@google-cloud/text-to-speech');
const {promises: fs} = require('fs');

class TextToMP3 {
  constructor(textToSpeechClient, _fs) {
    this._textToSpeechClient = textToSpeechClient;
    this._fs = _fs;
  }

  static create() {
    const textToSpeechClient = new TextToSpeechClient({
      keyFilename: 'key.json'
    });
    return new TextToMP3(
      textToSpeechClient,
      fs
    );
  }

  async convert(text, outputFilepath, voiceName, speakingRate, pitch) {
    const [response] = await this._textToSpeechClient.synthesizeSpeech({
      input: {text},
      voice: {
        languageCode: 'ru-RU',
        name: voiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
        pitch
      },
    });
    await this._fs.writeFile(outputFilepath, response.audioContent, 'binary');
  }
}

module.exports = TextToMP3;
