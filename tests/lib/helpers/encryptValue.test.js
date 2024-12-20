const t = require('tap')

const publicKey = '02b106c30579baf896ae1fddf077cbcb4fef5e7d457932974878dcb51f42b45498'
const privateKey = '1fc1cafa954a7a2bf0a6fbff46189c9e03e3a66b4d1133108ab9fcdb9e154b70'

const encryptValue = require('../../../src/lib/helpers/encryptValue')
const decryptKeyValue = require('../../../src/lib/helpers/decryptKeyValue')

t.test('#encryptValue', ct => {
  const result = encryptValue('hello', publicKey)
  ct.ok(result.startsWith('encrypted:'))

  const decrypted = decryptKeyValue('KEY', result, 'DOTENV_PRIVATE_KEY', privateKey)
  ct.same(decrypted, 'hello')

  ct.end()
})
