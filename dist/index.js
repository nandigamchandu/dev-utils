
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./technoidentity-dev-utils.cjs.production.min.js')
} else {
  module.exports = require('./technoidentity-dev-utils.cjs.development.js')
}
