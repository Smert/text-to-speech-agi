const {exec} = require('child_process');

class CLIDataProvider {
  constructor(_exec, command) {
    this._exec = _exec;
    this._command = command;
  }

  static create(command) {
    return new CLIDataProvider(
      exec,
      command
    );
  }

  run() {
    return new Promise((resolve, reject) => {
      this._exec(this._command, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout);
      });
    });
  }
}

module.exports = CLIDataProvider;
