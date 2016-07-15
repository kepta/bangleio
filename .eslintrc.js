module.exports = {
  'extends': 'airbnb',
  'parser': 'babel-eslint',
  'globals': {
    'mapboxgl': true,
    'expect': true,
    'it': true,
    'describe': true,
    'afterEach': true,
    'console.error': true,
  },

  'rules': {
    'max-len': ["error", {
        "code": 120,
        "ignoreComments": true,
        "ignoreTrailingComments": true,
        "ignoreUrls": true
    }],
    'react/jsx-pascal-case': 0,
    'arrow-body-style': [2, "as-needed"],
    "no-underscore-dangle": [0, ],
    'no-console': 1,
  }
};
