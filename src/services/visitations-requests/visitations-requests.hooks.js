const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const configureViewVisitationsRequestsQuery = require('../../hooks/configure-view-visitations-requests-query');

const formatViewVisitationsRequests = require('../../hooks/format-view-visitations-requests');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    // run some checks and configuration before the request, if this is an external request
    find: [ iff(isProvider('external'), configureViewVisitationsRequestsQuery()) ],
    get: [ disallow() ],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [ disallow() ],
    remove: []
  },

  after: {
    all: [],
    find: [ iff(isProvider('external'), formatViewVisitationsRequests()) ],
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
