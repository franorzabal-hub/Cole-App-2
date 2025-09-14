module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          reanimated: false // Desactivar el plugin problemático
        }
      ]
    ],
    plugins: [
      // 'react-native-reanimated/plugin', // Deshabilitado - causa error
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
            '@types': './src/types',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};