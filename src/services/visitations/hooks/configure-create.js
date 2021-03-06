/**
* visitations/hooks/configure-create
* This hook parses a create request to the visitations route, and depending on the context
* the request is made in, executes the proper method.
*/

const errors = require('feathers-errors');
const { visitationsCurrentlyAllowed } = require('../../../lib/visitations-scheduling');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const approvedVisitors = hook.app.service('/approved-visitors');
    const visitationsRequests = hook.app.service('/visitations-requests');
    const visitationsRestrictions = hook.app.service('/visitations-restrictions');
    const visitations = hook.service;

    if (!hook.data.visitorUsername || !hook.data.hostUsername) {
      throw new errors.BadRequest('A visitorUsername and hostUsername field must be provided in the request body.');
    }

    if (hook.data.visitorUsername === hook.data.hostUsername) {
      throw new errors.Forbidden('A user may not get Vs with themselves.');
    }

    // check if the visitor is on vs restriction
    return visitationsRestrictions.find({ query: {
      username: hook.data.visitorUsername,
      $limit: 0
    } })
    .then(results => {
      if (results.total > 0) { // if vs restictions found, throw error since the user can't get vs
        throw new errors.Forbidden('The user listed as visitor, with the username `' + hook.data.visitorUsername + '`, is on Vs restrictions, and cannot get Vs.');
      }
    })
    // check if the host is on vs restrictions; same logic as for visitor, more or less
    .then(() => visitationsRestrictions.find({ query: {
      username: hook.data.hostUsername,
      $limit: 0
    } }))
    .then(results => {
      if (results.total > 0) {
        throw new errors.Forbidden('The user listed as host, with the username `' + hook.data.hostUsername + '`, is on Vs restrictions, and cannot get Vs.');
      }
    })
    // check whether vs are currently allowed
    .then(() => {
      if (!visitationsCurrentlyAllowed()) {
        throw new errors.Forbidden('Visitations are not currently allowed.');
      }
    })
    // check if the visitor is already in a vs session as a visitor
    .then(() => visitations.find({ query: {
      ongoing: true,
      visitors: { $elemMatch: { username: hook.data.visitorUsername } }
    }}))
    .then(results => {
      // if the search returns results, meaning the visitor is or was part of a currently
      // ongoing Vs sesison, check whether this user has already left the Vs session
      if (results.total > 0) {
        // find the data for this visitor
        for (let visitorData of results.data[0].visitors) {
          if (visitorData.username === hook.data.visitorUsername) {
            // if the visitor hasn't left Vs, they can't join since they're already part of it,
            // so throw an error
            if (visitorData.timeLeftVs === null) {
              throw new errors.Forbidden('The user with the username `' + hook.data.visitorUsername + '` is currently a visitor in a visitations session, and may not join another as a visitor until they exit it.');
              break;
            }
          }
        }
      }
    })
    // check if this visitor is already in a vs session as a host
    .then(() => visitations.find({ query: {
      ongoing: true,
      hostUsername: hook.data.visitorUsername
    }}))
    .then(results => {
      // if they are already a host, see whether all the visitors are approved visitors
      // if so, the user need not be there, so they can get vs with someone else
      // if not, they must be overseeing the vs in their room, so this is not allowed
      if (results.total > 0) {
        // collect usernames of the visitors of the user requesting to be a visitor in a new Vs session
        let visitorsOfVisitor = [];
        for (let visitorData of results.data[0].visitors) {
          visitorsOfVisitor.push(visitorData.username);
        }

        // take a look at the AV list of the person requesting to be a visitor in a new Vs session
        // note that we use FIND and not GET because we have auth checking on the GET method, while
        // the FIND route, there are no such restrictions
        return approvedVisitors.find({ query: {
          listOwnerUsername: hook.data.visitorUsername
        }})
        .then(results => {
          // if not all the visitorsOfVisitor are a part of the approved visitor list, throw an error
          if (!visitorsOfVisitor.every(elem => results.data[0].approvedVisitors.indexOf(elem) > -1)) {
            throw new errors.Forbidden('The user with the username `' + hook.data.visitorUsername + '` is currently the host of a visitations session in which at least one visitor is not an approved visitor for this user.  This user may not join currently another visitations session as a visitor because they must be hosting that visitations session.');
          }
        });
      }
      // if we get to here, no errors have been thrown, and it is not a problem for this user to
      // become a visitor because of their involvement in other vs sessions
    })
    // check if this visitor has sent any Vs requests that are still present
    .then(() => visitationsRequests.find({ query: {
      visitorUsername: hook.data.visitorUsername
    }}))
    .then(results => {
      let promises = [];
      for (let result of results.data) {
        // if this request is for a different host, they can't get Vs with someone else, so throw an error
        if (result.hostUsername !== hook.data.hostUsername) {
          throw new errors.Forbidden('The user with the username `' + hook.data.visitorUsername +'` has already sent a visitations request to a user, and may not get visitations with another user until this request has been deleted.');
        }
        else {
          // if this request is for the same host, remove the request, and it will either be replaced
          // with a new one, or if the visitor is now an approved visitor, or has been approved
          // already via a visitations request, Vs will just start
          promises.push(visitationsRequests.remove(result._id, {}));
        }
      }
      return Promise.all(promises)
      .then(() => hook);
    })
    // now check if this visitor is an approved visitor for the host
    .then(() => {
      // if this is an internal server request, the user can join Vs regardless of whether
      // they are an approved visitor, so proceed to next .then function
      if (!hook.params.provider) { return; }

      // if this is an external server request, the user can join Vs ONLY IF THEY ARE AN
      // APPROVED VISITOR
      // check whether they are
      return approvedVisitors.find({ query: {
        listOwnerUsername: hook.data.hostUsername,
        approvedVisitors: hook.data.visitorUsername,
        $limit: 0 // don't actually return the data; we just care whether a doc matches this query
      }})
      .then(results => {
        // if the visitor is not an approved visitor, create a visitations request
        if (results.total === 0) {
          return hook.app.service('/visitations-requests').create({
            timeRequestIssued: (new Date()).getTime(),
            visitorUsername: hook.data.visitorUsername,
            hostUsername: hook.data.hostUsername
          })
          .then(result => {
            // set the result here; don't proceed with POST /api/visitations
            hook.result = {
              $actionPerformed: 'visitations request created', // what this request ended up doing
              visitationsRequestDocument: result
            };
            return hook;
          });
        }

        // if we get here, we don't need to make a request,
        // and we can just create a vs session, or add them to a session if one is ongoing
        // check if the host is currently hosting a Vs session
        return visitations.find({ query: {
          ongoing: true,
          hostUsername: hook.data.hostUsername
        }})
        .then(results => {
          // if the host is currently hosting a Vs session
          if (results.total > 0) {
            return hook.service.patch(results.data[0]._id, {
              op: 'addVisitor',
              visitorUsername: hook.data.visitorUsername
            })
            .then(result => {
              hook.result = result; // set the result here; don't proceed with POST request
              // the action performed in the end was that the visitor joined a vs session
              hook.result.$actionPerformed = 'visitations session joined';
              return hook;
            });
          }
        });

        // Since, if we get here, the visitor is an approved visitor of the host, and the
        // host is not already hosting a Vs session, we can proceed to create a new Vs session.
        // This will be accomplished after this hook's execution,
        // so all we have to do is note the action performed and return the hook object.
        hook.result.$actionPerformed = 'visitations session created';
        return hook;
      });
    })
  };
};
