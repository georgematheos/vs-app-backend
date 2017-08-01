/**
* format-view-visitations
* This hook formats the data properly for viewing visitations information.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const users = hook.app.service('/users');
    const approvedVisitors = hook.app.service('/approved-visitors');

    // either the hook.result.data contains vs sessions, or the hook.result is a vs session
    let visitationsSessions = hook.result.data || [ hook.result ];

    let updatedVisitationsSessions = []; // as we reformat vs sessions, we'll put them in this array
    let sessionPromises = []; // promises from loop over Vs sessions

    for (let session of visitationsSessions) {
      // the dormitory will be included on the host object, so no need to send it separately
      delete session.dormitory;

      // we will remove any visitor data if in the hook obj params we have noted that visitor data has to be removed
      // when the authenticated user isn't host, and that user is also not host for this Vs session
      let removeNonAuthenticatedVisitors = hook.params.removeVisitorDataIfNotHost && session.hostUsername !== hook.params.user.username;
      let visitorInfoNotReturned = false; // assume all visitor data will be returned; change if any is

      let userPromises = []; // promises for host and visitor object retrieval
      let visitors = []; // we'll collect the visitor user objects in this array

      userPromises.push(users.find({ query: { username: session.hostUsername }})
      .then(results => {
        if (results.total === 0) {
          throw new errors.GeneralError('The user data for the user with the username `' + session.hostUsername + '` cannot be found.');
        }

        // add user object results
        session.host = results.data[0];
        // don't return the id or password
        delete session.host._id;
        delete session.host.password;
      }));

      for (let visitorData of session.visitors) {
        // if we're supposed to remove not authenticted visitors, and this isn't an authenticated user,
        // continue the loop and don't add this person to the list
        if (removeNonAuthenticatedVisitors && visitorData.username !== hook.params.user.username) {
          visitorInfoNotReturned = true; // note that we are not including some of the visitor info
          continue;
        }

        userPromises.push(users.find({ query: { username: visitorData.username }})
        .then(results => {
          if (results.total === 0) {
            throw new errors.GeneralError('The user data for the user with the username `' + visitorData.username + '` cannot be found.');
          }

          let visitor = results.data[0]; // grab the visitor user object
          // don't return id, password, or roomNumber
          delete visitor._id;
          delete visitor.password;
          delete visitor.roomNumber;

          visitor.timeJoinedVs = visitorData.timeJoinedVs;
          visitor.timeLeftVs = visitorData.timeLeftVs;
          visitor.approvedVisitor = visitorData.approvedVisitor;

          visitors.push(visitor);
        }));
      }

      sessionPromises.push(Promise.all(userPromises)
      .then(() => {
        // store on this object whether information was removed
        session.visitorDataRemoved = visitorInfoNotReturned;

        // replace the results visitors object (which contains usernames) with the one we created
        // which contains user objects
        session.visitors = visitors;

        // delete the host username field
        delete session.hostUsername;

        // add this session to the list
        updatedVisitationsSessions.push(session);
      }));
    }

    return Promise.all(sessionPromises)
    .then(() => {
      // if the data field was included, we should return an array
      if (hook.result.data) {
        delete hook.result.data;
        hook.result.visitations = updatedVisitationsSessions;
      }
      // if no data field included, the whole result is the vs session
      else {
        hook.result = updatedVisitationsSessions[0];
      }

      return hook;
    });
  };
};
