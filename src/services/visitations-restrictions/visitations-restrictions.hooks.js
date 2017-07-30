const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard, iff, isProvider } = require('feathers-hooks-common');

const configurePutvisitationsRestrictions = require('../../hooks/configure-put-visitations-restrictions');

const formatViewvisitationsRestrictions = require('../../hooks/format-view-visitations-restrictions');

const configureViewvisitationsRestrictionsQuery = require('../../hooks/configure-view-visitations-restrictions-query');

const restrictTo = require('../../hooks/restrict-to');

module.exports = {
    before: {
    all: [ authenticate('jwt') ],
    find: [ iff(isProvider('external'), configureViewvisitationsRestrictionsQuery()) ],
    get: [ disallow('external') ],
    create: [ disallow('external') ],
    // for update method, restrictTo and ensureUserValidity hooks are within configure hook to
    // avoid querying the user database twice
    update: [ configurePutvisitationsRestrictions() ],
    patch: [ disallow() ],
    remove: [ restrictTo( // only deans or faculty in the dorm may delete a vs restriction
      { isDean: true },
      {
        isStudent: false,
        dormitory: { strategy: 'user', username: { strategy: 'id' }, fieldName: 'dormitory' }
      }
    ) ]
  },

  after: {
    all: [ discard('_id') ],
    find: [ formatViewvisitationsRestrictions() ],
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
