const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard } = require('feathers-hooks-common');

const configureAddRemovePatch = require('../../hooks/configure-add-remove-patch');
const restrictToUserType = require('../../hooks/restrict-to-user-type');
const usernameToUser = require('../../hooks/username-to-user');
const restrictToUsers = require('../../hooks/restrict-to-users');
const createDocIfNeeded = require('../../hooks/create-doc-if-needed');

const preventBlockedApprovedVisitorAddition = require('../../hooks/prevent-blocked-approved-visitor-addition');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ disallow('external') ],
    get: [
      restrictToUsers({ strategy: 'id' }),
      createDocIfNeeded(
      { listOwnerUsername: { strategy: 'id' } },
      { approvedVisitors: { strategy: 'included', value: [] } }
    )
    ],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [
      restrictToUserType({ // only boarding students may add or remove approved visitors
        isStudent: true,
        isDayStudent: false
      }),
      configureAddRemovePatch({
        addOp: 'addApprovedVisitor',
        removeOp: 'removeApprovedVisitor',
        ownerUsernameFieldName: 'listOwnerUsername',
        operateeUsernameFieldName: 'approvedVisitorUsername',
        operateeListFieldName: 'approvedVisitors',
        ownerDescription: 'the list owner',
        operateeDescription: 'an approved visitor',
        operateeMayPerformAdd: false,
        operateeMayPerformRemove: true,
        // only students may be approved visitors
        validOperateeTypes: [{ isStudent: true }]
      }),
      preventBlockedApprovedVisitorAddition()
    ],
    remove: [ disallow() ]
  },

  after: {
    all: [ discard('_id') ], // remove the id field
    find: [],
    get: [ usernameToUser( {
      fieldName: 'approvedVisitors',
      fieldsToRemove: [ 'roomNumber' ]
    },
    {
      fieldName: 'listOwnerUsername',
      newFieldName: 'listOwner'
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
