/* eslint no-console: 1 */

// only send event if user is authenticated, and is a faculty member, and is either a dean
// or in the dorm where vs are occurring
function deansAndDormFac(data, connection, hook) {
  if (!connection.user) return false;
  if (connection.user.isStudent) return false;

  if (connection.user.isDean || connection.user.dormitory === data.host.dormitory) {
    return data;
  }

  return false;
}

module.exports = {
  created: (data, connection, hook) => {
    // if the action performed was not creating the vs session, don't send anything
    if (data.$actionPerformed !== 'visitations session created') { return false; }

    // if a vs session was created, make sure only deans and dorm fac can recieve created events
    return deansAndDormFac(data, connection, hook);
  },
  updated: () => false,
  patched: deansAndDormFac,
  removed: () => false,
  visitorRemoved: (data, connection, hook) => {
    // if a user is authenticated, and it is either the host or the user who was just removed from vs
    // send the result to them
    console.log('removed visitor username:');
    console.log(data.removedVisitorUsername);
    if (connection.user &&
      connection.user.username === data.removedVisitorUsername
    ) {
      // return the username of the visitor who was removed
        return data;
    }
    return false;
  }
}
