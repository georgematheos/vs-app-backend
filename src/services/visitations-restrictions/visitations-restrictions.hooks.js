const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard, iff, isProvider } = require('feathers-hooks-common');

const restrictTo = require('../../hooks/restrict-to');

const configureFind = require('./hooks/configure-find');
const configureUpdate = require('./hooks/configure-update');
const deleteAutoEndTimedEvent = require('./hooks/delete-auto-end-timed-event');
const formatResults = require('./hooks/format-results');

module.exports = {
    before: {
    all: [ authenticate('jwt') ],
    find: [ iff(isProvider('external'), configureFind()) ],
    get: [ disallow('external') ],
    create: [ disallow('external') ],
    // for update method, restrictTo and ensureUserValidity hooks are within configure hook to
    // avoid querying the user database twice
    update: [ configureUpdate() ],
    patch: [ disallow('external') ],
    remove: [ iff(isProvider('external'), restrictTo( // only deans or faculty in the dorm may delete a vs restriction
      { isDean: true },
      {
        isStudent: false,
        dormitory: { strategy: 'user', username: { strategy: 'id' }, fieldName: 'dormitory' }
      }
    )) ]
  },

  after: {
    all: [ discard('_id') ],
    find: [ formatResults() ],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [ deleteAutoEndTimedEvent() ]
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
