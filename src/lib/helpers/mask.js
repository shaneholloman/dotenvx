function mask (str, showChar = 6) {
  if (!str || str.length < 1) {
    return ''
  }

  const visiblePart = str.slice(0, showChar)
  const maskedPart = '*'.repeat(Math.max(0, str.length - showChar))

  return visiblePart + maskedPart
}

module.exports = mask
