const { authenticate } = require('feathers-authentication').hooks;
const usernameToUser = require('../../hooks/username-to-user');

const errors = require('feathers-errors');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [
      // make sure the correct user is authenticated
      hook => {
        if (hook.id !== hook.params.user.username)
        throw new errors.NotAuthenticated('only the user with username `' + hook.id + '` may make this request');
      }
    ],
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
      newFieldName: 'approvedVisitor',
      fieldsToRemove: [ '_id', 'password' ]
    },
    {
      fieldName: 'hostApprovers',
      fieldsToRemove: [ '_id', 'password', 'roomNumber' ]
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
