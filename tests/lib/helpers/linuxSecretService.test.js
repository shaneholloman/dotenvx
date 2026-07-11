const t = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const helperPath = '../../../src/lib/helpers/linuxSecretService'

t.afterEach(() => {
  sinon.restore()
})

t.test('writes a secret through secret-tool with the private key on stdin', t => {
  const execFileSync = sinon.stub().returns('')
  const secretService = proxyquire(helperPath, {
    child_process: { execFileSync }
  })

  secretService.addGenericPassword('public-key', 'dotenvx (PUB LIC)', 'private-key-that-must-not-be-an-argument')

  t.same(execFileSync.firstCall.args, ['secret-tool', [
    'store',
    '--label=dotenvx (PUB LIC)',
    'service', 'dotenvx',
    'public-key', 'public-key'
  ], {
    input: 'private-key-that-must-not-be-an-argument',
    encoding: 'utf8',
    stdio: ['pipe', 'ignore', 'pipe']
  }])
  t.notMatch(execFileSync.firstCall.args[1].join(' '), /private-key-that-must-not-be-an-argument/)
  t.end()
})

t.test('reads a secret through secret-tool', t => {
  const execFileSync = sinon.stub().returns('private-key\n')
  const secretService = proxyquire(helperPath, {
    child_process: { execFileSync }
  })

  t.equal(secretService.findGenericPassword('public-key'), 'private-key')
  t.same(execFileSync.firstCall.args, ['secret-tool', [
    'lookup',
    'service', 'dotenvx',
    'public-key', 'public-key'
  ], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }])
  t.end()
})

t.test('deletes a secret through secret-tool', t => {
  const execFileSync = sinon.stub().returns('')
  const secretService = proxyquire(helperPath, {
    child_process: { execFileSync }
  })

  secretService.deleteGenericPassword('public-key')

  t.same(execFileSync.firstCall.args, ['secret-tool', [
    'clear',
    'service', 'dotenvx',
    'public-key', 'public-key'
  ], {
    stdio: ['ignore', 'ignore', 'pipe']
  }])
  t.end()
})

t.test('sanitizes failed secret-tool writes', t => {
  const privateKey = 'private-key-that-must-not-leak'
  const execFileSync = sinon.stub().throws(new Error(`secret-tool failed with ${privateKey}`))
  const secretService = proxyquire(helperPath, {
    child_process: { execFileSync }
  })

  const error = t.throws(() => secretService.addGenericPassword('public-key', 'label', privateKey), /failed to save private key to Linux Secret Service/)

  t.notMatch(error.message, privateKey)
  t.end()
})
