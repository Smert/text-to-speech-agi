const DingDong = require('ding-dong');
const Handler = require('./Handler');

class AGIServer {
  constructor(agiPort, handler) {
    this._agiPort = agiPort;
    this._handler = handler;
  }

  static create(agiPort, recordsDir, voiceName) {
    return new AGIServer(agiPort, (context) => {
      Handler.create(context, recordsDir, voiceName).handle();
    });
  }

  start() {
    new DingDong(this._handler).start(this._agiPort);
    console.log('agi server started on port', this._agiPort);
  }
}

module.exports = AGIServer;
