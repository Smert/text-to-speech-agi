#!/usr/bin/env node

const program = require('commander');
const AGIServer = require('../src/AGIServer');

const DEFAULT_RECORDS_DIR = '/tmp/text-to-speech';

program
  .requiredOption('-p, --port [port]', 'port for fast-agi server')
  .option('-r, --records [records]', 'path to records dir. Default: ' + DEFAULT_RECORDS_DIR)
  .helpOption('-h, --help', 'read more information')
  .parse(process.argv);

const options = program.opts();
AGIServer.create(
  options.port,
  options.records || DEFAULT_RECORDS_DIR
).start();
