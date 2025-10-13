export const logger = {
  info: (message, ...args) => console.log(`ℹ️  ${message}`, ...args),
  success: (message, ...args) => console.log(`✅ ${message}`, ...args),
  warn: (message, ...args) => console.warn(`⚠️  ${message}`, ...args),
  error: (message, ...args) => console.error(`❌ ${message}`, ...args),
  debug: (message, ...args) => console.log(`🐛 ${message}`, ...args),
};