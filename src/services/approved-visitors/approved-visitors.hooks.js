const { authenticate } = require('feathers-authentication').hooks;
const { disallow, discard, iff, isProvider } = require('feathers-hooks-common');

const configureAddRemovePatch = require('../../hooks/configure-add-remove-patch');
const ensureUserValidity = require('../../hooks/ensure-user-validity');
const restrictTo = require('../../hooks/restrict-to');
const usernameToUser = require('../../hooks/username-to-user');
const createDocIfNeeded = require('../../hooks/create-doc-if-needed');
const checkQueryMatch = require('../../lib/check-query-match');

const preventBlockedApprovedVisitorAddition = require('./hooks/prevent-blocked-approved-visitor-addition');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [ disallow('external') ],
    get: [
      // make sure the user whose approved visitors we're getting is a boarding student
      ensureUserValidity( { strategy: 'user', username: { strategy: 'id' } },
      { isStudent: true, isDayStudent: false }
     ),
     // make sure the authenticated user is permitted to access this list
      restrictTo(
        { username: { strategy: 'id' }, isStudent: true, isDayStudent: false }, // a boarding student may view their own approved visitors
        { isStudent: false, // a faculty member may view users in their dorm's approved visitors
          dormitory: { strategy: 'user', username: { strategy: 'id' }, fieldName: 'dormitory' }
        },
        { isDean: true } // a dean may view any user's approved visitors
      ),
      createDocIfNeeded(
      { listOwnerUsername: { strategy: 'id' } },
      { approvedVisitors: { strategy: 'included', value: [] } }
    )
    ],
    create: [ disallow('external') ],
    update: [ disallow() ],
    patch: [
      // only boarding students may add or remove approved visitors
      restrictTo({ isStudent: true, isDayStudent: false }),
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
    all: [ iff(isProvider('external'), discard('_id')) ], // remove the id field if this is an external request
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
    patch: [
      // if the operatee is making this request, don't send back the approved visitors list
      iff( hook => hook.params.user.username === hook.params.operateeUsername,
        discard('approvedVisitors') )
      ],
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
