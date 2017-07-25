/**
* format-visitations-doc-creation
* This hook formats the data in a visitations request in the way visitations objects
* are stored in the database.
* By the time this hook is called, it should already be certain that a new visitations object
* must be created, in which there is currently only one visitor.
*/

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const currentTime = (new Date()).getTime(); // the time this request is being processed

    /* First, format the info about the users in the Vs session */
    // we'll store the host solely as their username
    // so we don't have to do anything to the hostUsername field on the hook data

    // we'll store the visitor in an array, where each visitor will be stored in an object
    // that contains username, timeJoinedVs, and timeLeftVs
    // right now, there is only one visitor
    hook.data.visitors = [ { username: hook.data.visitorUsername, timeJoinedVs: currentTime, timeLeftVs: null } ];
    delete hook.data.visitorUsername;

    // store start time and end time
    hook.data.startTime = currentTime; // Vs are starting right now
    hook.data.endTime = null; // Vs haven't ended yet
    hook.data.ongoing = true; // Vs haven't ended yet

  };
};
