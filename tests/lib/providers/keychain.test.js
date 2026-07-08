const t = require('tap')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const platformDescriptor = Object.getOwnPropertyDescriptor(process, 'platform')

function setPlatform (value) {
  Object.defineProperty(process, 'platform', {
    value
  })
}

t.afterEach(() => {
  sinon.restore()
  Object.defineProperty(process, 'platform', platformDescriptor)
})

t.test('keychain provider is disabled outside macOS', ct => {
  const execFileSync = sinon.stub()
  const provider = proxyquire('../../../src/lib/providers/keychain', {
    child_process: { execFileSync }
  })

  setPlatform('linux')

  ct.same(provider('public-key'), {})
  ct.equal(execFileSync.callCount, 0)
  ct.end()
})

t.test('keychain provider reads macOS Keychain on darwin', ct => {
  const execFileSync = sinon.stub().returns('private-key\n')
  const provider = proxyquire('../../../src/lib/providers/keychain', {
    child_process: { execFileSync }
  })

  setPlatform('darwin')

  ct.same(provider('public-key'), { 'public-key': 'private-key' })
  ct.same(execFileSync.firstCall.args, ['/usr/bin/security', ['find-generic-password', '-s', 'dotenvx', '-a', 'public-key', '-w'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore']
  }])
  ct.end()
})
