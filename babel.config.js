module.exports = {
  presets: ['module:@react-native/babel-preset'],
    plugins: [
        '@babel/plugin-transform-export-namespace-from',
        [
            'module-resolver',
            {
                root: ['./src'],
                extensions: [
                    '.ios.ts',
                    '.android.ts',
                    '.ts',
                    '.ios.tsx',
                    '.android.tsx',
                    '.tsx',
                    '.jsx',
                    '.js',
                    '.json',
                ],
                alias: {
                    '@': './src'
                },
            },
        ],
    ],

};
