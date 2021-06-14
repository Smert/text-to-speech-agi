#!/usr/bin/env node

const program = require('commander');
const AGIServer = require('../src/AGIServer');

const DEFAULT_RECORDS_DIR = '/tmp/text-to-speech';
const DEFAULT_VOICE = 'ru-RU-Wavenet-C';

program
  .requiredOption('-p, --port [port]', 'port for fast-agi server')
  .option('-r, --records [records]', 'path to records dir. Default: ' + DEFAULT_RECORDS_DIR)
  .option('-v, --voice [voice]', 'voice name. Default: ' + DEFAULT_VOICE)
  .helpOption('-h, --help', 'read more information')
  .parse(process.argv);

const options = program.opts();
AGIServer.create(
  options.port,
  options.records || DEFAULT_RECORDS_DIR,
  options.voice || DEFAULT_VOICE
).start();
