const { authenticate } = require('feathers-authentication').hooks;
const { disallow } = require('feathers-hooks-common');

const configurePutVsRestrictions = require('../../hooks/configure-put-vs-restrictions');

const formatViewVsRestrictions = require('../../hooks/format-view-vs-restrictions');

const configureViewVsRestrictionsQuery = require('../../hooks/configure-view-vs-restrictions-query');

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
    remove: []
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
