const { execFileSync } = require('child_process')

const keynames = require('../conventions/keynames')
const readEnvKey = require('../helpers/readEnvKey')
const armoredKeyDisplay = require('../helpers/armoredKeyDisplay')

const SECURITY_BIN = '/usr/bin/security'
const SERVICE = 'dotenvx'

class KeychainUp {
  constructor (envFile = '.env', envKeysFile = '.env.keys') {
    this.envFile = envFile
    this.envKeysFile = envKeysFile
  }

  run () {
    const envFile = this.envFile
    const envKeysFile = this.envKeysFile

    const {
      publicKeyName,
      privateKeyName
    } = keynames(envFile)

    const publicKey = readEnvKey(publicKeyName, envFile, { strict: true, ignore: ['MISSING_PRIVATE_KEY'] })
    const privateKey = readEnvKey(privateKeyName, envKeysFile, { strict: true })
    const label = `dotenvx (${armoredKeyDisplay(publicKey)})`

    execFileSync(SECURITY_BIN, ['add-generic-password', '-U', '-s', SERVICE, '-a', publicKey, '-l', label, '-w', privateKey], { stdio: 'ignore' })

    return {
      changed: true,
      label,
      privateKeyName,
      privateKeyValue: privateKey,
      publicKeyValue: publicKey
    }
  }
}

module.exports = KeychainUp
