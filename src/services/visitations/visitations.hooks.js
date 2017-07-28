const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const formatVisitationsDocCreation = require('../../hooks/format-visitations-doc-creation');

const formatViewVisitations = require('../../hooks/format-view-visitations');

const formatViewVisitationsQuery = require('../../hooks/format-view-visitations-query');

const configureCreateVisitations = require('../../hooks/configure-create-visitations');

const configureVisitationsPatch = require('../../hooks/configure-visitations-patch');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ formatViewVisitationsQuery() ],
    get: [ disallow('external') ],
    create: [ configureCreateVisitations(), formatVisitationsDocCreation() ],
    update: [ disallow() ],
    patch: [ configureVisitationsPatch() ],
    remove: [ disallow() ]
  },

  after: {
    all: [],
    // if this is request is NOT coming from within the server, format the visitations objects as specified by the API
    find: [ iff(isProvider('external'), formatViewVisitations()) ],
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
