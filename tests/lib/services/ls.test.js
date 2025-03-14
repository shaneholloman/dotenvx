const t = require('tap')

const Ls = require('../../../src/lib/services/ls')

t.test('#run', ct => {
  const ls = new Ls('./tests')

  const envFiles = ls.run()

  const expected = [
    '.env',
    '.env.eval',
    '.env.expand',
    '.env.export',
    '.env.latin1',
    '.env.local',
    '.env.multiline',
    '.env.utf16le',
    '.env.vault',
    'monorepo/.env.keys',
    'monorepo/apps/app1/.env',
    'monorepo/apps/app1/.env.production',
    'monorepo/apps/backend/.env',
    'monorepo/apps/backend/.env.example',
    'monorepo/apps/backend/.env.keys',
    'monorepo/apps/backend/.env.previous',
    'monorepo/apps/backend/.env.untracked',
    'monorepo/apps/backend/.env.vault',
    'monorepo/apps/encrypted/.env',
    'monorepo/apps/encrypted/.env.keys',
    'monorepo/apps/frontend/.env',
    'monorepo/apps/multiline/.env',
    'monorepo/apps/multiline/.env.crlf',
    'monorepo/apps/multiple/.env',
    'monorepo/apps/multiple/.env.keys',
    'monorepo/apps/multiple/.env.production',
    'monorepo/apps/shebang/.env',
    'monorepo/apps/unencrypted/.env'
  ]

  ct.same(envFiles, expected)

  ct.end()
})

t.test('#run (with directory argument)', ct => {
  const ls = new Ls('./tests/monorepo/')

  const envFiles = ls.run()

  const expected = [
    '.env.keys',
    'apps/app1/.env',
    'apps/app1/.env.production',
    'apps/backend/.env',
    'apps/backend/.env.example',
    'apps/backend/.env.keys',
    'apps/backend/.env.previous',
    'apps/backend/.env.untracked',
    'apps/backend/.env.vault',
    'apps/encrypted/.env',
    'apps/encrypted/.env.keys',
    'apps/frontend/.env',
    'apps/multiline/.env',
    'apps/multiline/.env.crlf',
    'apps/multiple/.env',
    'apps/multiple/.env.keys',
    'apps/multiple/.env.production',
    'apps/shebang/.env',
    'apps/unencrypted/.env'
  ]

  ct.same(envFiles, expected)

  ct.end()
})

t.test('#run (with somehow malformed directory argument)', ct => {
  const ls = new Ls('tests/monorepo')

  const envFiles = ls.run()

  const expected = [
    '.env.keys',
    'apps/app1/.env',
    'apps/app1/.env.production',
    'apps/backend/.env',
    'apps/backend/.env.example',
    'apps/backend/.env.keys',
    'apps/backend/.env.previous',
    'apps/backend/.env.untracked',
    'apps/backend/.env.vault',
    'apps/encrypted/.env',
    'apps/encrypted/.env.keys',
    'apps/frontend/.env',
    'apps/multiline/.env',
    'apps/multiline/.env.crlf',
    'apps/multiple/.env',
    'apps/multiple/.env.keys',
    'apps/multiple/.env.production',
    'apps/shebang/.env',
    'apps/unencrypted/.env'
  ]

  ct.same(envFiles, expected)

  ct.end()
})

t.test('#_filepaths', ct => {
  const ls = new Ls('./tests')

  const envFiles = ls._filepaths()

  const expected = [
    '.env',
    '.env.eval',
    '.env.expand',
    '.env.export',
    '.env.latin1',
    '.env.local',
    '.env.multiline',
    '.env.utf16le',
    '.env.vault',
    'monorepo/.env.keys',
    'monorepo/apps/app1/.env',
    'monorepo/apps/app1/.env.production',
    'monorepo/apps/backend/.env',
    'monorepo/apps/backend/.env.example',
    'monorepo/apps/backend/.env.keys',
    'monorepo/apps/backend/.env.previous',
    'monorepo/apps/backend/.env.untracked',
    'monorepo/apps/backend/.env.vault',
    'monorepo/apps/encrypted/.env',
    'monorepo/apps/encrypted/.env.keys',
    'monorepo/apps/frontend/.env',
    'monorepo/apps/multiline/.env',
    'monorepo/apps/multiline/.env.crlf',
    'monorepo/apps/multiple/.env',
    'monorepo/apps/multiple/.env.keys',
    'monorepo/apps/multiple/.env.production',
    'monorepo/apps/shebang/.env',
    'monorepo/apps/unencrypted/.env'
  ]

  ct.same(envFiles, expected)

  ct.end()
})

t.test('#_patterns', ct => {
  const ls = new Ls()

  const patterns = ls._patterns()

  const expected = ['**/.env*']

  ct.same(patterns, expected)

  ct.end()
})

t.test('#_patterns (envFile set to string)', ct => {
  const ls = new Ls(undefined, '.env')

  const patterns = ls._patterns()

  const expected = ['**/.env']

  ct.same(patterns, expected)

  ct.end()
})

t.test('#_patterns (envFile set to array)', ct => {
  const ls = new Ls(undefined, ['.env.keys'])

  const patterns = ls._patterns()

  const expected = ['**/.env.keys']

  ct.same(patterns, expected)

  ct.end()
})

t.test('#_patterns (excludeEnvFile set to string)', ct => {
  const ls = new Ls(undefined, undefined, '.env')

  const excludePatterns = ls._excludePatterns()
  const exclude = ls._exclude()

  const expected = ['**/.env']
  const ignore = ['node_modules/**', '.git/**']

  ct.same(excludePatterns, expected)
  ct.same(exclude, ignore.concat(expected))

  ct.end()
})

t.test('#_patterns (excludeEnvFile set to array)', ct => {
  const ls = new Ls(undefined, undefined, ['.env.keys'])

  const excludePatterns = ls._excludePatterns()
  const exclude = ls._exclude()

  const expected = ['**/.env.keys']
  const ignore = ['node_modules/**', '.git/**']

  ct.same(excludePatterns, expected)
  ct.same(exclude, ignore.concat(expected))

  ct.end()
})
