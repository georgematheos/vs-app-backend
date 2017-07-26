const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

const formatVisitationsDocCreation = require('../../hooks/format-visitations-doc-creation');

const formatViewVisitations = require('../../hooks/format-view-visitations');

const formatViewVisitationsQuery = require('../../hooks/format-view-visitations-query');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [formatViewVisitationsQuery()],
    get: [ disallow() ],
    create: [ formatVisitationsDocCreation() ],
    update: [ disallow() ],
    patch: [],
    remove: [ disallow() ]
  },

  after: {
    all: [],
    find: [formatViewVisitations()],
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
