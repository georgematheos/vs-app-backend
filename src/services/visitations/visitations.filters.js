/* eslint no-console: 1 */

module.exports = {
  created: (data, connection, hook) => {
    // only send this if user is authenticated, and is a faculty member, and is either a dean
    // or in the dorm where vs are occurring
    if (!connection.user) return false;
    if (connection.user.isStudent) return false;

    if (connection.user.isDean || connection.user.dormitory === data.host.dormitory) {
      return data;
    }

    return false;
  }
  ,
  updated: () => false,
  patched: () => false,
  removed: () => false
}
