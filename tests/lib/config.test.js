const fs = require('fs')
const fsx = require('../../src/lib/helpers/fsx')
const os = require('os')
const path = require('path')
const sinon = require('sinon')
const t = require('tap')

const dotenvx = require('../../src/lib/main')
const { logger } = require('../../src/shared/logger')

t.beforeEach((ct) => {
  // important, clear process.env before each test
  process.env = {}
})

t.test('takes string for path option', ct => {
  const testPath = 'tests/.env'
  const env = dotenvx.config({ path: testPath })

  ct.equal(env.parsed.BASIC, 'basic')
  ct.equal(process.env.BASIC, 'basic')

  ct.end()
})

t.test('takes array for path option', ct => {
  const testPath = ['tests/.env']
  const env = dotenvx.config({ path: testPath })

  ct.equal(env.parsed.BASIC, 'basic')
  ct.equal(process.env.BASIC, 'basic')

  ct.end()
})

t.test('takes two or more files in the array for path option', ct => {
  const testPath = ['tests/.env.local', 'tests/.env']
  const env = dotenvx.config({ path: testPath })

  ct.equal(env.parsed.BASIC, 'local_basic')
  ct.equal(process.env.BASIC, 'local_basic')

  ct.end()
})

t.test('sets values from both .env.local and .env. first file key wins.', ct => {
  delete process.env.SINGLE_QUOTES

  const testPath = ['tests/.env.local', 'tests/.env']
  const env = dotenvx.config({ path: testPath })

  // in both files - first file wins (.env.local)
  ct.equal(env.parsed.BASIC, 'local_basic')
  ct.equal(process.env.BASIC, 'local_basic')

  // in .env.local only
  ct.equal(env.parsed.LOCAL, 'local')
  ct.equal(process.env.LOCAL, 'local')

  // in .env only
  ct.equal(env.parsed.SINGLE_QUOTES, 'single_quotes')
  ct.equal(process.env.SINGLE_QUOTES, 'single_quotes')

  ct.end()
})

t.test('sets values from both .env.local and .env. but neither is used as value existed in process.env.', ct => {
  const testPath = ['tests/.env.local', 'tests/.env']
  process.env.BASIC = 'existing'

  const env = dotenvx.config({ path: testPath })

  // does not override process.env
  ct.equal(env.parsed.BASIC, 'existing')
  ct.equal(process.env.BASIC, 'existing')

  ct.end()
})

t.test('takes option for path along with home directory char ~', ct => {
  const readFileXStub = sinon.stub(fsx, 'readFileX').returns('test=foo')
  const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('test=foo') // for purpose of encoding check
  const mockedHomedir = '/Users/dummy'
  const homedirStub = sinon.stub(os, 'homedir').returns(mockedHomedir)
  const testPath = '~/.env'
  dotenvx.config({ path: testPath })

  ct.equal(readFileXStub.args[0][0], path.join(mockedHomedir, '.env'))
  ct.ok(homedirStub.called)

  homedirStub.restore()
  readFileXStub.restore()
  readFileSyncStub.restore()
  ct.end()
})

t.test('reads path with encoding, parsing output to process.env', ct => {
  const readFileXStub = sinon.stub(fsx, 'readFileX').returns('BASIC=basic')
  const readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('test=foo') // for purpose of encoding check
  const parseStub = sinon.stub(dotenvx, 'parse').returns({ BASIC: 'basic' })

  const res = dotenvx.config()

  ct.same(res.parsed, { BASIC: 'basic' })
  ct.equal(readFileXStub.callCount, 1)
  ct.equal(readFileSyncStub.callCount, 1) // encoding check

  readFileXStub.restore()
  parseStub.restore()
  readFileSyncStub.restore()

  ct.end()
})

t.test('does not write over keys already in process.env', ct => {
  const testPath = 'tests/.env'
  const existing = 'bar'
  process.env.BASIC = existing
  const env = dotenvx.config({ path: testPath })

  ct.equal(env.parsed.BASIC, 'bar')
  ct.equal(process.env.BASIC, 'bar')

  ct.end()
})

t.test('writes over keys already in process.env if override turned on', ct => {
  const testPath = 'tests/.env'
  const existing = 'bar'
  process.env.BASIC = existing
  const env = dotenvx.config({ path: testPath, override: true })

  ct.equal(env.parsed.BASIC, 'basic')
  ct.equal(process.env.BASIC, 'basic')

  ct.end()
})

t.test('does not write over keys already in process.env if the key has a falsy value', ct => {
  const testPath = 'tests/.env'
  process.env.BASIC = ''
  const env = dotenvx.config({ path: testPath })

  ct.equal(env.parsed.BASIC, '')
  ct.equal(process.env.BASIC, '')

  ct.end()
})

t.test('does write over keys already in process.env if the key has a falsy value but override is set to true', ct => {
  const testPath = 'tests/.env'
  const existing = ''
  process.env.BASIC = existing
  const env = dotenvx.config({ path: testPath, override: true })

  ct.equal(env.parsed.BASIC, 'basic')
  ct.equal(process.env.BASIC, 'basic')
  ct.end()
})

t.test('can write to a different object rather than process.env', ct => {
  const testPath = 'tests/.env'
  process.env.BASIC = 'other' // reset process.env

  const myObject = {}
  const env = dotenvx.config({ path: testPath, processEnv: myObject })

  ct.equal(env.parsed.BASIC, 'basic')
  ct.equal(process.env.BASIC, 'other')
  ct.equal(myObject.BASIC, 'basic')

  ct.end()
})

t.test('returns parsed object', ct => {
  const testPath = 'tests/.env'
  const env = dotenvx.config({ path: testPath })

  ct.notOk(env.error)
  ct.equal(env.parsed.BASIC, 'basic')

  ct.end()
})

t.test('returns any errors thrown from reading file or parsing', ct => {
  const readFileXStub = sinon.stub(fsx, 'readFileX').returns('test=foo')

  readFileXStub.throws()
  const env = dotenvx.config()

  ct.type(env.error, Error)

  readFileXStub.restore()

  ct.end()
})

t.test('logs any errors thrown from reading file or parsing when in debug mode', ct => {
  ct.plan(2)

  const consoleErrorStub = sinon.stub(console, 'error')
  const readFileXStub = sinon.stub(fsx, 'readFileX').returns('test=foo')

  readFileXStub.throws()
  const env = dotenvx.config({ debug: true })

  ct.ok(consoleErrorStub.called)
  ct.type(env.error, Error)

  consoleErrorStub.restore()
  readFileXStub.restore()
})

t.test('logs when in debug mode', ct => {
  ct.plan(2)
  const logStub = sinon.stub(logger, 'debug')

  dotenvx.config({ debug: true })

  ct.equal(logger.level, 'debug')
  ct.ok(logStub.calledWith('Setting log level to debug'))

  logStub.restore()
})

t.test('logs only errors in quiet mode', ct => {
  dotenvx.config({ quiet: true })

  ct.equal(logger.level, 'error')

  ct.end()
})

t.test('logs in verbose mode', ct => {
  ct.plan(2)

  const logStub = sinon.stub(logger, 'debug')

  dotenvx.config({ verbose: true })

  ct.equal(logger.level, 'verbose')
  ct.ok(logStub.calledWith('Setting log level to verbose'))

  logStub.restore()
})

t.test('sets specific log level and logs it', ct => {
  ct.plan(2)

  const logStub = sinon.stub(logger, 'debug')

  dotenvx.config({ logLevel: 'warn' })

  ct.equal(logger.level, 'warn')
  ct.ok(logStub.calledWith('Setting log level to warn'))

  logStub.restore()
})

t.test('verbose mode overrides quiet mode', ct => {
  ct.plan(2)

  const logStub = sinon.stub(logger, 'debug')

  dotenvx.config({ quiet: true, verbose: true })

  ct.equal(logger.level, 'verbose')
  ct.ok(logStub.calledWith('Setting log level to verbose'))

  logStub.restore()
})

t.test('quiet mode overrides specific log level', ct => {
  dotenvx.config({ logLevel: 'warn', quiet: true })

  ct.equal(logger.level, 'error')

  ct.end()
})

t.test('debug mode overrides logLevel, quiet, verbose', ct => {
  dotenvx.config({ logLevel: 'warn', debug: true, quiet: true, verbose: true })

  ct.equal(logger.level, 'debug')

  ct.end()
})
