/**
* create-visitor-object
* Given a visitor username, host username, the time, and the hook object, this returns a promise that resolves to an object
* which is a visitor object for server-side storage in a visitations document.
*/

function createVisitorObject(visitorUsername, hostUsername, time, hook) {
  // check if the visitor is an approved visitor of the host
  return hook.app.service('/approved-visitors').find({ query: {
    listOwnerUsername: hostUsername,
    approvedVisitors: visitorUsername,
    $limit: 0
  } })
  .then(results => {
    // resolve to a visitor object with all the following fields
    return {
      username: visitorUsername,
      timeJoinedVs: time,
      timeLeftVs: null,
      // if results were found for the above query, the visitor IS an approved visitor
      isApprovedVisitor: results.total > 0
    };
  });
}

module.exports = createVisitorObject;
