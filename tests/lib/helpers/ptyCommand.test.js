const t = require('tap')
const path = require('path')
const ptyCommand = require('../../../src/lib/helpers/ptyCommand')

t.test('ptyCommand wraps a command for macOS script without shell quoting', ct => {
  const result = ptyCommand(['/path/with spaces/claude', "it's", '--flag'], 'darwin')

  ct.equal(path.basename(result[0]), 'script')
  ct.same(result.slice(1), ['-q', '/dev/null', '/path/with spaces/claude', "it's", '--flag'])
  ct.end()
})

t.test('ptyCommand safely quotes a command for util-linux script', ct => {
  const result = ptyCommand(['/usr/bin/claude', 'hello world', "it's"], 'linux')

  ct.equal(path.basename(result[0]), 'script')
  ct.same(result.slice(1), ['-qefc', "'/usr/bin/claude' 'hello world' 'it'\"'\"'s'", '/dev/null'])
  ct.end()
})

t.test('ptyCommand is unavailable on unsupported platforms', ct => {
  ct.equal(ptyCommand(['claude'], 'win32'), null)
  ct.end()
})
