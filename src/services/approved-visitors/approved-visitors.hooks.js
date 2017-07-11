const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

const configureApprovedVisitorsPatch = require('../../hooks/configure-approved-visitors-patch');
const restrictToUserType = require('../../hooks/restrict-to-user-type.js');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [
      restrictToUserType({ validTypes: [ { // only boarding students may add or remove approved visitors
        isStudent: true,
        isDayStudent: false
      } ]}),
      configureApprovedVisitorsPatch()
    ],
    remove: [ disallow() ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
