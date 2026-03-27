import CryptoJS from 'crypto-js';

// Encrypt plain text using AES and the Room's Secret Key
export const encryptMessage = (plainText, secretKey) => {
  if (!plainText || !secretKey) return '';
  const ciphertext = CryptoJS.AES.encrypt(plainText, secretKey).toString();
  return ciphertext;
};

// Decrypt ciphertext using AES and the Room's Secret Key
export const decryptMessage = (ciphertext, secretKey) => {
  if (!ciphertext || !secretKey) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    return "⚠️ [Encrypted/Unreadable Message]";
  }
};