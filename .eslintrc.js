module.exports = {
    env: {
      browser: true,
      'jest/globals': true,
    },
    globals: {
      browser: true,
    },
    extends: [
      'airbnb', // tons of good defaults (very strict)
      'plugin:flowtype/recommended', // optional for flow!
      'plugin:jest/recommended',
      'prettier', // disable all rules that conflict with prettier
      'prettier/react', // disable all rules that conflict with prettier
      'prettier/flowtype', // disable all rules that conflict with prettier
    ],
    // only include flow-type if we are using flow
    plugins: ['flowtype', 'jest', 'react-hooks'],
    rules: {
      // START: Only if using flow
      'react/prop-types': 'off',
      'react/default-props-match-prop-types': 'off',
      'react/no-multi-comp': 'off',
      'react/require-default-props': 'off',
  
      // require "// flow" at the top of all js files
      'flowtype/require-valid-file-annotation': [
        2,
        'always',
        {
          annotationStyle: 'line',
        },
      ],
      // STOP: Only if using flow
  
      // Hooks :)
      'react-hooks/rules-of-hooks': 'error',
  
      'no-plusplus': 'off',
      'import/prefer-default-export': 'off',
  
      // airbnb rules that are too picky
      'react/destructuring-assignment': 'off',
  
      'lines-between-class-members': 'off', // too strict
  
      // we import types from jest
      'jest/no-jest-import': 'off',
  
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
        },
      ],
    },
  };