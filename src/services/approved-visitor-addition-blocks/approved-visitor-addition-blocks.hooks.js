const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard } = require('feathers-hooks-common');

const configureAddRemovePatch = require('../../hooks/configure-add-remove-patch');
const restrictTo = require('../../hooks/restrict-to');
const usernameToUser = require('../../hooks/username-to-user');
const createDocIfNeeded = require('../../hooks/create-doc-if-needed');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ disallow('external') ],
    get: [
      // make sure the user whose approved visitor blocks we're getting is a student
      ensureUserValidity( { strategy: 'user', username: { strategy: 'id' } },
      { isStudent: true }
     ),
      // make sure the authenticated user is permitted to access this list
      restrictTo(
        { username: { strategy: 'id' }, isStudent: true }, // a student may view their own approved visitor blocks
        { isDean: true } // a dean may view any user's approved visitor blocks
      ),
      createDocIfNeeded(
      { blockerUsername: { strategy: 'id' } },
      { blockees: { strategy: 'included', value: [] } }
    )
 ],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [
      // only students may add or remove approved visitors
      restrictTo({ isStudent: true }),
      configureAddRemovePatch({
        addOp: 'addBlock',
        removeOp: 'removeBlock',
        ownerUsernameFieldName: 'blockerUsername',
        operateeUsernameFieldName: 'blockeeUsername',
        operateeListFieldName: 'blockees',
        ownerDescription: 'the blocker',
        operateeDescription: 'a blockee',
        operateeMayPerformAdd: false,
        operateeMayPerformRemove: false,
        // only boarding students may be blocked (since only they may add approved visitors)
        validOperateeTypes: [{ isStudent: true, isDayStudent: false }]
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
