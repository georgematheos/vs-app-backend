const { disallow, iff } = require('feathers-hooks-common');

const configurePatch = require('./hooks/configure-patch');
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
    // set a timer if we are supposed to, but not otherwise
    patch: [ iff(hook => hook.params.setTimer, setEventTimer()) ],
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
