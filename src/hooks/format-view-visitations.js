/**
* format-view-visitations
* This hook formats the data properly for a find request to the visitations service.
*/

const errors = require('feathers-errors');
const usernameToUser = require('./username-to-user');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const users = hook.app.service('/users');
    const approvedVisitors = hook.app.service('/approved-visitors');

    let visitationsSessions = hook.result.data;
    delete hook.result.data;
    let updatedVisitationsSessions = []; // as we reformat vs sessions, we'll put them in this array
    let sessionPromises = []; // promises from loop over Vs sessions

    for (let session of visitationsSessions) {
      // the id should be returned in an `id` field, not a `_id` field
      session.id = session._id;
      delete session._id;

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

          return approvedVisitors.find({ query: { hostUsername: session.hostUsername, approvedVisitors: visitor.username } })
          .then(results => {
            // set the isApprovedVisitor field to true if there is a result that matches this query,
            // since that would mean the visitor IS an approved visitor of the host's
            visitor.isApprovedVisitor = (results.total > 0);

            visitors.push(visitor); // add this visitor to the array we're creating
          });
        }));
      }

      sessionPromises.push(Promise.all(userPromises)
      .then(() => {
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

      // put the sessions as a field on the result
      hook.result.visitations = updatedVisitationsSessions;

      return hook;
    });
  };
};
