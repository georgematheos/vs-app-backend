const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

const configurePutVsRestrictions = require('../../hooks/configure-put-vs-restrictions');

const formatViewVsRestrictions = require('../../hooks/format-view-vs-restrictions');

const configureViewVsRestrictionsQuery = require('../../hooks/configure-view-vs-restrictions-query');

const restrictTo = require('../../hooks/restrict-to');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ configureViewVsRestrictionsQuery() ],
    get: [ disallow('external') ],
    create: [ disallow('external') ],
    // for update method, restrictTo and ensureUserValidity hooks are within configure hook to
    // avoid querying the user database twice
    update: [ configurePutVsRestrictions() ],
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
    all: [],
    find: [ formatViewVsRestrictions() ],
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
