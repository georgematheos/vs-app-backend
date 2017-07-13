const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard } = require('feathers-hooks-common');

const configureApprovedVisitorsPatch = require('../../hooks/configure-approved-visitors-patch');
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
      restrictToUserType({ validTypes: [ { // only boarding students may add or remove approved visitors
        isStudent: true,
        isDayStudent: false
      } ]}),
      configureAddRemovePatch({
        serviceName: 'approved-visitors',
        addOp: 'addApprovedVisitor',
        removeOp: 'removeApprovedVisitor',
        ownerUsernameFieldName: 'listOwnerUsername',
        operateeUsernameFieldName: 'approvedVisitorUsername',
        operateeListFieldName: 'approvedVisitors',
        ownerDescription: 'list owner',
        operateeDescription: 'approved visitor',
        operateeMayPerformAdd: false,
        operateeMayPerformRemove: true
      })
    ],
    remove: [ disallow() ]
  },

  after: {
    all: [ discard('_id') ], // remove the id field
    find: [],
    get: [ usernameToUser( {
      fieldName: 'approvedVisitors',
      fieldsToRemove: [ '_id', 'password', 'roomNumber' ]
    },
    {
      fieldName: 'listOwnerUsername',
      newFieldName: 'listOwner',
      fieldsToRemove: [ '_id', 'password' ]
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
