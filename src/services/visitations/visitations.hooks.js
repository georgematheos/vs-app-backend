const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const ensureUserValidity = require('../../hooks/ensure-user-validity');
const restrictTo = require('../../hooks/restrict-to');
const changeFieldName = require('../../hooks/change-field-name');

const configureAutomaticEnding = require('./hooks/configure-automatic-ending');
const configureCreate = require('./hooks/configure-create');
const configureDocumentCreation = require('./hooks/configure-document-creation');
const configureFind = require('./hooks/configure-find');
const configurePatch = require('./hooks/configure-patch');
const emitVisitorRemovedEvents = require('./hooks/emit-visitor-removed-events');
const formatResults = require('./hooks/format-results');
const restrictAfterGet = require('./hooks/restrict-after-get');

module.exports = {
  before: {
    all: [ iff(isProvider('external'), authenticate('jwt')) ],
    // format the query if this is an external request, but not if it's an internal one
    find: [ iff(isProvider('external'), configureFind()) ],
    get: [],
    create: [
      // make sure the visitor is the one making this request (if it is external; if server is making it, always allow it)
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
      configureCreate(),
      configureDocumentCreation()
    ],
    update: [ disallow() ],
    patch: [ configurePatch() ],
    remove: [ disallow() ]
  },

  after: {
    all: [ changeFieldName('_id', 'id') ],
    // if this is request is NOT coming from within the server, format the visitations objects as specified by the API
    find: [ iff(isProvider('external'), formatResults()) ],
    get: [ iff(isProvider('external'), restrictAfterGet(), formatResults())],
    create: [
      // if the $actionPerformed has not been set, it means we proceeded with creating a visitations session, so the action
      // is that a visitations session was created
      hook => {
        hook.result.$actionPerformed = hook.result.$actionPerformed || 'visitations session created';
        return hook;
      },
      // if this was the creation of a Vs session,
      // configure the Vs session to end at the proper time.
      // Also, we will be sending an event about its creation, so format it nicely
      iff( hook => hook.result.$actionPerformed === 'visitations session created',
      configureAutomaticEnding(),
      formatResults())
    ],
    update: [],
    // make sure results are nicely formatted for `patched` events
    // and send any `visitorRemoved` events that should be emitted
    patch: [ formatResults(), emitVisitorRemovedEvents() ],
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
