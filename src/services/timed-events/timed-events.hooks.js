const { disallow, iff } = require('feathers-hooks-common');

const configurePatch = require('./hooks/configure-patch');
const cancelEventTimer = require('./hooks/cancel-event-timer');
const setEventTimer = require('./hooks/set-event-timer');

module.exports = {
  before: {
    // this service is for internal server usage only
    all: [ disallow('external') ],
    find: [],
    get: [],
    create: [],
    update: [ disallow() ], // to modify time, use patch; to modify anything else, create a new timed event
    patch: [ configurePatch() ],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ setEventTimer() ],
    update: [],
    // set a timer if we are supposed to (after canceling the old timer), but not otherwise
    patch: [ iff(hook => hook.params.setTimer, cancelEventTimer(), setEventTimer()) ],
    remove: [ cancelEventTimer() ]
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
