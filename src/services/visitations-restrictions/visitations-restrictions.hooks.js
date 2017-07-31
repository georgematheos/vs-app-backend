const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard, iff, isProvider } = require('feathers-hooks-common');

const configurePutVisitationsRestrictions = require('../../hooks/configure-put-visitations-restrictions');

const formatViewVisitationsRestrictions = require('../../hooks/format-view-visitations-restrictions');

const configureViewVisitationsRestrictionsQuery = require('../../hooks/configure-view-visitations-restrictions-query');

const restrictTo = require('../../hooks/restrict-to');

module.exports = {
    before: {
    all: [ authenticate('jwt') ],
    find: [ iff(isProvider('external'), configureViewVisitationsRestrictionsQuery()) ],
    get: [ disallow('external') ],
    create: [ disallow('external') ],
    // for update method, restrictTo and ensureUserValidity hooks are within configure hook to
    // avoid querying the user database twice
    update: [ configurePutVisitationsRestrictions() ],
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
    find: [ formatViewVisitationsRestrictions() ],
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
