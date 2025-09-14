// Custom Metro config to handle react-native-safe-area-context compatibility
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};

// Handle compatibility issues with react-native-safe-area-context
const { resolve } = require('metro-resolver');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept codegenNativeComponent and provide a mock for Expo
  if (moduleName === 'react-native/Libraries/Utilities/codegenNativeComponent') {
    // Return a mock implementation that works with Expo
    return {
      type: 'sourceFile',
      filePath: require.resolve('./src/utils/codegenNativeComponentMock.js'),
    };
  }

  // Default resolution
  return resolve(context, moduleName, platform);
};

module.exports = config;