const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard } = require('feathers-hooks-common');

const configureAddRemovePatch = require('../../hooks/configure-add-remove-patch');
const restrictToUserType = require('../../hooks/restrict-to-user-type');
const usernameToUser = require('../../hooks/username-to-user');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [
      restrictToUserType({ // only students may add or remove approved visitors
      isStudent: true
    }),
    configureAddRemovePatch({
      serviceName: 'approved-visitor-addition-blocks',
      addOp: 'addBlock',
      removeOp: 'removeBlock',
      ownerUsernameFieldName: 'blockerUsername',
      operateeUsernameFieldName: 'blockeeUsername',
      operateeListFieldName: 'blockees',
      ownerDescription: 'the blocker',
      operateeDescription: 'a blockee',
      operateeMayPerformAdd: false,
      operateeMayPerformRemove: false
    })
  ],
    remove: [ disallow() ]
  },

  after: {
    all: [ discard('_id') ], // remove the id field
    find: [],
    get:  [ usernameToUser( {
      fieldName: 'blockees',
      fieldsToRemove: [ 'roomNumber' ]
    },
    {
      fieldName: 'blockerUsername',
      newFieldName: 'blocker'
    })
    ],
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
