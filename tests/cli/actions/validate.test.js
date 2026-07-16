const t = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()

const { logger } = require('../../../src/shared/logger')

let envsResolverStub
const validate = proxyquire('../../../src/cli/actions/validate', {
  './../../lib/resolvers/envs': (...args) => envsResolverStub(...args),
  '../../lib/helpers/createSpinner': async () => null,
  '../../db/session': class {
    async noArmor () {
      return true
    }
  }
})

t.beforeEach(() => {
  sinon.restore()
  envsResolverStub = sinon.stub().resolves({
    processedEnvs: [],
    readableFilepaths: []
  })
})

t.test('validate succeeds silently when .env.example requirements are present', async t => {
  const cwd = process.cwd()
  const dir = t.testdir({
    '.env': 'DATABASE_URL=postgres://localhost\n',
    '.env.example': 'DATABASE_URL=\n'
  })
  process.chdir(dir)
  const processExitStub = sinon.stub(process, 'exit')
  const loggerErrorStub = sinon.stub(logger, 'error')
  const loggerSuccessStub = sinon.stub(logger, 'success')
  const fakeContext = {
    opts: () => ({}),
    envs: []
  }

  envsResolverStub.callsFake(async (options) => {
    options.processEnv.DATABASE_URL = 'postgres://localhost'
    return {
      processedEnvs: [],
      readableFilepaths: ['.env']
    }
  })

  await validate.call(fakeContext)

  t.equal(processExitStub.callCount, 0)
  t.equal(loggerErrorStub.callCount, 0)
  t.equal(loggerSuccessStub.callCount, 1)
  t.equal(loggerSuccessStub.firstCall.args[0], '▣ validated')

  process.chdir(cwd)
  t.end()
})

t.test('validate exits 1 and logs validation errors', async t => {
  const cwd = process.cwd()
  const dir = t.testdir({
    '.env': '',
    '.env.example': 'DATABASE_URL=\n'
  })
  process.chdir(dir)
  const processExitStub = sinon.stub(process, 'exit')
  const loggerErrorStub = sinon.stub(logger, 'error')
  const fakeContext = {
    opts: () => ({}),
    envs: []
  }

  await validate.call(fakeContext)

  t.equal(processExitStub.callCount, 1)
  t.equal(processExitStub.firstCall.args[0], 1)
  t.equal(loggerErrorStub.callCount, 1)
  t.match(loggerErrorStub.firstCall.args[0], /\[VALIDATION_FAILED\] missing required \(DATABASE_URL\)/)

  process.chdir(cwd)
  t.end()
})

t.test('validate exits 1 and logs resolver errors', async t => {
  const cwd = process.cwd()
  const dir = t.testdir({
    '.env.example': ''
  })
  process.chdir(dir)
  const processExitStub = sinon.stub(process, 'exit')
  const loggerErrorStub = sinon.stub(logger, 'error')
  const fakeContext = {
    opts: () => ({}),
    envs: []
  }
  const error = new Error('[MISSING_ENV_FILE] missing file (.env)')
  error.code = 'MISSING_ENV_FILE'
  error.messageWithHelp = '[MISSING_ENV_FILE] missing file (.env). fix: [https://github.com/dotenvx/dotenvx/issues/484]'
  envsResolverStub.resolves({
    processedEnvs: [{ errors: [error] }],
    readableFilepaths: []
  })

  await validate.call(fakeContext)

  t.equal(processExitStub.callCount, 1)
  t.equal(processExitStub.firstCall.args[0], 1)
  t.equal(loggerErrorStub.callCount, 1)
  t.match(loggerErrorStub.firstCall.args[0], /\[MISSING_ENV_FILE\] missing file \(\.env\)/)

  process.chdir(cwd)
  t.end()
})
