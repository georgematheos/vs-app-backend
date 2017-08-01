const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const formatVisitationsDocCreation = require('../../hooks/format-visitations-doc-creation');
const formatViewVisitations = require('../../hooks/format-view-visitations');
const formatViewVisitationsQuery = require('../../hooks/format-view-visitations-query');
const configureCreateVisitations = require('../../hooks/configure-create-visitations');
const configureVisitationsPatch = require('../../hooks/configure-visitations-patch');
const ensureUserValidity = require('../../hooks/ensure-user-validity');
const restrictTo = require('../../hooks/restrict-to');
const changeFieldName = require('../../hooks/change-field-name');
const configureAutomaticVisitationsEnding = require('../../hooks/configure-automatic-visitations-ending');

module.exports = {
  before: {
    all: [ iff(isProvider('external'), authenticate('jwt')) ],
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
    all: [ changeFieldName('_id', 'id') ],
    // if this is request is NOT coming from within the server, format the visitations objects as specified by the API
    find: [ iff(isProvider('external'), formatViewVisitations()) ],
    get: [],
    create: [
      // if the actionPerformed field hasn't already been set on the result, we created a vs
      // session, so make 'visitations session created' its value
      hook => {
        hook.result.$actionPerformed = hook.result.$actionPerformed || 'visitations session created';
        return hook;
      },
      configureAutomaticVisitationsEnding(),
      formatViewVisitations()
    ],
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
