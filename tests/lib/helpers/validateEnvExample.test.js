const t = require('tap')
const fs = require('fs')

const validateEnvExample = require('../../../src/lib/helpers/validateEnvExample')

t.test('validateEnvExample returns MISSING_ENV_EXAMPLE when .env.example is missing', t => {
  const cwd = process.cwd()
  const dir = t.testdir({})
  process.chdir(dir)

  const error = validateEnvExample({})

  t.equal(error.code, 'MISSING_ENV_EXAMPLE')
  t.equal(error.message, '[MISSING_ENV_EXAMPLE] missing .env.example file')

  process.chdir(cwd)
  t.end()
})

t.test('validateEnvExample returns VALIDATION_FAILED when required keys are missing', t => {
  const cwd = process.cwd()
  const dir = t.testdir({
    '.env.example': 'DATABASE_URL=\nAPI_KEY=\nOPTIONAL= # optional\n'
  })
  process.chdir(dir)

  const error = validateEnvExample({})

  t.equal(error.code, 'VALIDATION_FAILED')
  t.equal(error.message, '[VALIDATION_FAILED] missing required (DATABASE_URL, API_KEY)')

  process.chdir(cwd)
  t.end()
})

t.test('validateEnvExample returns undefined when valid', t => {
  const cwd = process.cwd()
  const dir = t.testdir({})
  process.chdir(dir)
  fs.writeFileSync('.env.example', 'DATABASE_URL=\nOPTIONAL= # optional\n')

  const error = validateEnvExample({ DATABASE_URL: 'postgres://localhost' })

  t.equal(error, undefined)

  process.chdir(cwd)
  t.end()
})
