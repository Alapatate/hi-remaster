const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next/dist/commonjs/index.js'),
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
