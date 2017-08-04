/**
* visitations/hooks/configure-document-creation
* This hook formats the data in a request to the visitations service in the way visitations objects
* are stored in the database.
* By the time this hook is called, it should already be certain that a new visitations object
* must be created, in which there is currently only one visitor.
*/

const errors = require('feathers-errors');
const createVisitorObject = require('../../../lib/create-visitor-object');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const currentTime = (new Date()).getTime(); // the time this request is being processed

    if (!hook.data.visitorUsername || !hook.data.hostUsername) {
      throw new errors.Unprocessable('A visitorUsername and hostUsername must be provided with the request.');
    }

    /* First, format the info about the users in the Vs session */
    // we'll store the host solely as their username
    // so we don't have to do anything to the hostUsername field on the hook data

    // we'll store the visitor in an array, where each visitor will be stored in an object
    // that can be created using this function
    // right now, there is only one visitor, so just add an object for them
    return createVisitorObject(hook.data.visitorUsername, hook.data.hostUsername, currentTime, hook)
    .then(visitorObj => {
      // add this object in an array to the data, and delete the username
      hook.data.visitors = [ visitorObj ];
      delete hook.data.visitorUsername;

      // store start time and end time
      hook.data.startTime = currentTime; // Vs are starting right now
      hook.data.endTime = null; // Vs haven't ended yet
      hook.data.ongoing = true; // Vs haven't ended yet

    })
    // store dormitory on the object (we'll need to get it from the host's user info)
    .then(() => hook.app.service('/users').find({ query: { username: hook.data.hostUsername } }))
    .then(results => {
      if (results.total === 0) {
        throw new errors.GeneralError('The user with username `' + hook.data.hostUsername + '` cannot be found.  This problem should have been addressed before it reached this hook (the format-visitations-doc-creation hook).');
      };

      hook.data.dormitory = results.data[0].dormitory;

      return hook;
    });

  };
};
