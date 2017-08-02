/**
* configure-visitations-patch
* Configure patch requests to the visitations field so they can be successful.
*/

const errors = require('feathers-errors');
const createVisitorObject = require('../lib/create-visitor-object');
const restrictTo = require('./restrict-to');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const currentTime = (new Date()).getTime(); // the time this request is being processed

    if (!hook.data.op) {
      throw new errors.BadRequest('The field `op` must be included in a PATCH request.');
    }

    // store the operation that was performed on the hook params so after hooks can view this
    hook.params.op = hook.data.op;

    switch (hook.data.op) {
      case 'removeVisitor':
        // make sure the username of the visitor to remove was included
        if (!hook.data.visitorUsername) {
          throw new errors.BadRequest('A remove visitors request must have the field `visitorUsername` included in the request body.');
        }

        const visitorToRemoveUsername = hook.data.visitorUsername;

        // so we can access this in after hooks, put it on hook.params
        hook.params.removedVisitorUsername = visitorToRemoveUsername;

        let removingLastVisitor = true; // assume we're removing the last visitor in Vs, change if this is false
        let visitorToRemoveFound = false; // assume we won't find the user to remove until we do
        let visitorCurrentlyInVs = false; // assume the visitor has already left Vs until proven otherwise

        // now, enter a chain of promises
        // start by getting the info on this Vs session
        return hook.service.get(hook.id, {})
        // quickly check to make sure either the visitor or host is trying to remove the visitor, otherwise throw an error
        .then(result => {
          return restrictTo(
            { username: visitorToRemoveUsername },
            { username: result.hostUsername }
          )(hook)
          .then(() => result); // make sure to return the result we found earlier; we still need it
        })
        // now, the logic for actually formatting everything
        .then(result => {
          let newVisitorsData = []; // we'll recollect the visitors data to format it as needed for the PATCH
          for (let oldVisitorData of result.visitors) {
            // if this isn't the visitor to remove
            if (oldVisitorData.username !== visitorToRemoveUsername) {
              // if this visitor hasn't left yet, we ARE NOT removing the last visitor
              if (!oldVisitorData.timeLeftVs) {
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
          if (!visitorToRemoveFound) {
            throw new errors.NotFound('The user with the username `' + visitorToRemoveUsername + '` was and is not a visitor in this Vs session, and thus cannot be removed as a visitor.');
          }
          // if the following is true, the previous if was true also, so this second check must
          // come second, since otherwise the first one would never be reached
          if (!visitorCurrentlyInVs) {
            throw new errors.Unprocessable('This user with the username `' + visitorToRemoveUsername + '` has already left the Vs session, and has not returned, so they cannot be removed.');
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

      case 'addVisitor':
        // only internal server requests may do this, so throw error if this is an extrenal request
        if (hook.params.provider) {
          throw new errors.Forbidden('Visitors may not be added by a patch request (unless it is an internal server request). Perhaps use the `POST /api/visitations` command instead.');
        }

        if (!hook.data.visitorUsername) {
          throw new errors.Unprocessable('A visitorUsername was not included with the request to add a visitor to a Vs session. This error is being thrown from the configure-visitations-patch hook.');
        }

        // get the Vs info so we can get the current visitors
        return hook.service.get(hook.id, {})
        .then(result => {
          // make sure this Vs session isn't over yet
          if (!result.ongoing) {
            throw new errors.Forbidden('This visitations session has already ended, and a visitor may not be added to a completed Vs session.');
          }

          let visitorsList = result.visitors; // the list of visitors

          // make a new visitors object for the user we will add to the visitors list
          return createVisitorObject(hook.data.visitorUsername, result.hostUsername, currentTime, hook)
          .then(visitorObj => {
            visitorsList.push(visitorObj); // add this visitor to the list

            // format patch request properly
            hook.data = {};
            hook.data.visitors = visitorsList;

            return hook;
          });
        });

      case 'endVisitations':
        // store the usernames of all the visitors we have to remove in here,
        // to put on the hook.params, so after hooks know which visitors were removed
        let visitorsToRemoveUsernames = [];

        // get this vs session's info
        return hook.service.get(hook.id, {})
        .then(result => {
          // if this visitations session has already ended, throw error
          if (!result.ongoing) {
            throw new errors.Forbidden('This visitations session has already ended; it may not be ended again');
          }

          // we will throw an error if anyone but the host or the server is trying to perform this request
          // but we don't have to do this restriction if this is an internal server request, so in that
          // case, just return the result and move on
          if (hook.params.provider === undefined) { return result; }

          return restrictTo({ username: result.hostUsername })(hook)
          .then(() => result); // make sure to return the result; we'll need it again
        })
        // now perform the rest of the logic for configuring this request
        .then(result => {
          let newVisitorsData = [];
          // for each visitor, if they haven't left, note that they are leaving now
          for (let oldVisitorData of result.visitors) {
            // if visitor hasn't left yet
            if (!oldVisitorData.timeLeftVs) {
              // they are leaving now
              oldVisitorData.timeLeftVs = currentTime;

              // add this user's username to the list of visitors being removed from Vs,
              // since they are being removed here
              visitorsToRemoveUsernames.push(oldVisitorData.username);
            }
            newVisitorsData.push(oldVisitorData);
          }

          // format everything as needed for patch
          hook.data = {};
          hook.data.visitors = newVisitorsData;
          configureVsSessionEnding();

          // save this array to the hook params
          hook.params.visitorsToRemoveUsernames = visitorsToRemoveUsernames;

          return hook;
        });

      // if the op isn't recognized, throw an error
      default:
        throw new errors.Unprocessable('the provided operation (op: `' + hook.data.op + '`) was not recognized');
    }

    function configureVsSessionEnding() {
      hook.data.endTime = currentTime;
      hook.data.ongoing = false;

      // this IS automatically ended if it is an internal request ending the Vs, false otherwise
      hook.data.automaticallyEnded = (hook.params.provider === undefined);
    }
  };
};
