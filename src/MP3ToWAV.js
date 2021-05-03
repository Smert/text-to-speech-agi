const CLIDataProvider = require('./CLIDataProvider');

class MP3ToWAV {
  constructor(convertCommand) {
    this._convertCommand = convertCommand;
  }

  static create() {
    const convertCommand = (inputFilepath, outputFilepath) => {
      return CLIDataProvider
        .create(`ffmpeg -i "${inputFilepath}" -ar 8000 -ac 1 -ab 64 -y "${outputFilepath}"`)
        .run();
    };
    return new MP3ToWAV(convertCommand);
  }

  async convert(inputFilepath, outputFilepath) {
    await this._convertCommand(inputFilepath, outputFilepath);
  }
}

module.exports = MP3ToWAV;
