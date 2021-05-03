// TODO Retry policy
class Handler {
  constructor(context) {
    this._context = context;
  }

  static handle(context) {
    new Handler(context).handle();
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
    console.log('variables', JSON.stringify(variables));
    // agi_arg_1

    console.log('Finish');
    await this._context.end();
  }
}

module.exports = Handler;
