const { authenticate } = require('feathers-authentication').hooks;
const { disallow, iff, isProvider } = require('feathers-hooks-common');

const changeFieldName = require('../../hooks/change-field-name');

const configureExpiration = require('./hooks/configure-expiration');
const configureFind = require('./hooks/configure-find');
const configureRemove = require('./hooks/configure-remove');
const deleteExpirationTimedEvent = require('./hooks/delete-expiration-timed-event');
const formatResults = require('./hooks/format-results');
const preventBlockedVisitationsRequestCreation = require('./hooks/prevent-blocked-visitations-request-creation');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    // run some checks and configuration before the request, if this is an external request
    find: [ iff(isProvider('external'), configureFind()) ],
    get: [ disallow('external') ],
    create: [
      disallow('external'),
      preventBlockedVisitationsRequestCreation()
    ],
    update: [ disallow() ],
    patch: [ disallow('external') ],
    remove: [ iff(isProvider('external'), configureRemove()) ]
  },

  after: {
    all: [ changeFieldName('_id', 'id') ],
    find: [ iff(isProvider('external'), formatResults()) ],
    get: [],
    // also format the visitations request data on a create request, so that when events
    // are sent, everything is formatted properly
    create: [ configureExpiration(), formatResults() ],
    update: [],
    patch: [],
    // if the actionPerformed hasn't been set, it means all we did was delete the request,
    // so communicate this using that field
    remove: [ hook => {
      hook.result.$actionPerformed = hook.result.$actionPerformed || 'visitations request deleted';
      return hook;
    }, deleteExpirationTimedEvent() ]
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
