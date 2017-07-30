const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const configureViewVisitationsRequestsQuery = require('../../hooks/configure-view-visitations-requests-query');
const formatViewVisitationsRequests = require('../../hooks/format-view-visitations-requests');
const configureRemoveVisitationsRequest = require('../../hooks/configure-remove-visitations-request');
const preventBlockedVsRequestCreation = require('../../hooks/prevent-blocked-vs-request-creation');
const changeFieldName = require('../../hooks/change-field-name');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    // run some checks and configuration before the request, if this is an external request
    find: [ iff(isProvider('external'), configureViewVisitationsRequestsQuery()) ],
    get: [ disallow('external') ],
    create: [ disallow('external'), preventBlockedVsRequestCreation() ],
    update: [ disallow() ],
    patch: [ disallow() ],
    remove: [ iff(isProvider('external'), configureRemoveVisitationsRequest()) ]
  },

  after: {
    all: [ iff(isProvider('external'), changeFieldName('_id', 'id')) ],
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
