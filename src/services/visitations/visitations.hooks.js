const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

const formatVisitationsDocCreation = require('../../hooks/format-visitations-doc-creation');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [ disallow() ],
    create: [ formatVisitationsDocCreation() ],
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
