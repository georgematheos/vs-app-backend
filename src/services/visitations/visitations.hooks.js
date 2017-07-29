const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const formatVisitationsDocCreation = require('../../hooks/format-visitations-doc-creation');
const formatViewVisitations = require('../../hooks/format-view-visitations');
const formatViewVisitationsQuery = require('../../hooks/format-view-visitations-query');
const configureCreateVisitations = require('../../hooks/configure-create-visitations');
const configureVisitationsPatch = require('../../hooks/configure-visitations-patch');
const ensureUserValidity = require('../../hooks/ensure-user-validity');
const restrictTo = require('../../hooks/restrict-to');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    // format the query if this is an external request, but not if it's an internal one
    find: [ iff(isProvider('external'), formatViewVisitationsQuery()) ],
    get: [ disallow('external') ],
    create: [
      // make sure the visitor is the one making this request
      iff(isProvider('external'), restrictTo(
        { username: { strategy: 'data', fieldName: 'visitorUsername' } }
      )),
      // make sure the visitor is a student
      ensureUserValidity(
        { strategy: 'user', username: { strategy: 'data', fieldName: 'visitorUsername' } },
        { isStudent: true }
      ),
      // make sure the host is a boarding student
      ensureUserValidity(
        { strategy: 'user', username: { strategy: 'data', fieldName: 'hostUsername' } },
        { isStudent: true, isDayStudent: false }
      ),
      configureCreateVisitations(),
      formatVisitationsDocCreation()
    ],
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
