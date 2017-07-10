const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ disallow() ],
    get: [],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [],
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
