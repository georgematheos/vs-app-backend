/**
* configure-visitations-patch
* Configure patch requests to the visitations field so they can be successful.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const currentTime = (new Date()).getTime(); // the time this request is being processed

    if (!hook.data.op) {
      throw new errors.BadRequest('The field `op` must be included in a PATCH request.');
    }

    switch (hook.data.op) {
      case 'removeVisitor':
        // make sure the username of the visitor to remove was included
        if (!hook.data.visitorUsername) {
          throw new errors.BadRequest('A remove visitors request must have the field `visitorUsername` included in the request body.');
        }

        let removingLastVisitor = true; // assume we're removing the last visitor in Vs, change if this is false
        let visitorToRemoveFound = false; // assume we won't find the user to remove until we do
        let visitorCurrentlyInVs = false; // assume the visitor has already left Vs until proven otherwise

        // get the info on this Vs session
        return hook.service.get(hook.id, {})
        .then(result => {
          let newVisitorsData = []; // we'll recollect the visitors data to format it as needed for the PATCH
          for (let oldVisitorData of result.visitors) {
            // if this isn't the visitor to remove
            if (oldVisitorData.username !== hook.data.visitorUsername) {
              // if this visitor hasn't left yet, we ARE NOT removing the last visitor
              if (!oldVisitorData.endTime) {
                removingLastVisitor = false;
              }
            }
            // if this the visitor to remove
            else {
              // if this visitorDatum records a visitor who hasn't left Vs
              if (!oldVisitorData.timeLeftVs) {
                visitorCurrentlyInVs = true; // visitor IS currently in the Vs session
                oldVisitorData.timeLeftVs = currentTime; // now we're removing them, so this is when they left
              }

              // note that this is designed to allow multiple visitor data objects
              // to be on any Vs session for one user, to allow for
              // a user joining Vs, leaving, and then rejoining.
              // if this happens, we'll just add a new visitor object the second time,
              // with different join and leave times

              visitorToRemoveFound = true; // we did find the visitor to remove
            }
            // add this datum to the array
            newVisitorsData.push(oldVisitorData);
          }

          // handle a couple of error cases
          if (!visitorCurrentlyInVs) {
            throw new errors.Unprocessable('This user with the username `' + hook.data.visitorUsername + '` has already left the Vs session, and has not returned, so they cannot be removed.');
          }
          if (!visitorToRemoveFound) {
            throw new errors.NotFound('The user with the username `' + hook.data.visitorUsername + '` was not a visitor in this Vs session, and thus cannot be removed as a visitor.');
          }

          // if there is only one visitor there (and it's the one we're removing),
          // we ARE removing the last visitor
          if (newVisitorsData.length === 1) {
            removingLastVisitor = true;
          }

          // now format the hook data as is necessary for the patch request
          hook.data = {};
          hook.data.visitors = newVisitorsData;

          // if we are removing the last visitor, end the Vs session
          if (removingLastVisitor) {
            configureVsSessionEnding();
          }

          return hook;
        });

      case 'endVisitations':
        // get this vs session's info
        return hook.service.get(hook.id, {})
        .then(result => {
          let newVisitorsData = [];
          // for each visitor, if they haven't left, note that they are leaving now
          for (let oldVisitorData of result.visitors) {
            if (!oldVisitorData.endTime) {
              oldVisitorData.timeLeftVs = currentTime;
            }
            newVisitorsData.push(oldVisitorData);
          }

          // format everything as needed for patch
          hook.data = {};
          hook.data.visitors = newVisitorsData;
          configureVsSessionEnding();

          return hook;
        });

      // if the op isn't recognized, throw an error
      default:
        throw new errors.Unprocessable('the provided operation (op: `' + hook.data.op + '`) was not recognized');
    }

    function configureVsSessionEnding() {
      hook.data.endTime = currentTime;
      hook.data.ongoing = false;
    }
  };
};
