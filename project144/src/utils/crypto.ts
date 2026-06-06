import CryptoJS from 'crypto-js'

export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString()
}

export const generateIV = (): string => {
  return CryptoJS.lib.WordArray.random(16).toString()
}

export const hashPassword = (password: string, salt?: string): { hash: string; salt: string } => {
  const finalSalt = salt ?? generateSalt()
  const hash = CryptoJS.SHA256(password + finalSalt).toString()
  return { hash, salt: finalSalt }
}

export const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const result = hashPassword(password, salt)
  return result.hash === hash
}

export const deriveKey = (masterPassword: string, salt: string): string => {
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 100000
  })
  return key.toString()
}

export const encryptData = (data: unknown, key: string): { encryptedData: string; iv: string } => {
  const jsonString = JSON.stringify(data)
  const iv = CryptoJS.lib.WordArray.random(16)
  const ciphertext = CryptoJS.AES.encrypt(jsonString, CryptoJS.enc.Hex.parse(key), {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return {
    encryptedData: ciphertext.toString(),
    iv: iv.toString()
  }
}

export const decryptData = (encryptedData: string, key: string, iv: string): unknown => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(key), {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decryptedString)
}

export const generateChecksum = (data: string, key: string): string => {
  return CryptoJS.HmacSHA256(data, key).toString()
}

export const verifyChecksum = (data: string, key: string, checksum: string): boolean => {
  const generatedChecksum = generateChecksum(data, key)
  return generatedChecksum === checksum
}

export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const hashPasswordPrefix = (password: string): { prefix: string; suffix: string } => {
  const hash = CryptoJS.SHA1(password).toString().toUpperCase()
  return {
    prefix: hash.slice(0, 5),
    suffix: hash.slice(5)
  }
}
