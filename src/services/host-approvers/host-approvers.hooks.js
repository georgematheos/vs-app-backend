const { authenticate } = require('feathers-authentication').hooks;
const restrictTo = require('../../hooks/restrict-to');
const usernameToUser = require('../../hooks/username-to-user');

// NOTE: currently, we don't have to worry about anything except the get method
// because the others are not implemented
module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [ restrictTo({ username: { strategy: 'id' } }) ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [ usernameToUser({
      fieldName: 'approvedVisitorUsername',
      newFieldName: 'approvedVisitor'
    },
    {
      fieldName: 'hostApprovers'
    }) ],
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
