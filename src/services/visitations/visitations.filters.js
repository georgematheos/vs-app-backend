/* eslint no-console: 1 */

module.exports = {
  created: (data, connection, hook) => {
    // only send this if user is authenticated, and is either a faculty member in the dormitory
    // where vs are starting, or is a dean
    if (connection.user && (
      (!connection.user.isStudent && connection.user.dormitory === data.host.dormitory) || connection.user.isDean
    )) {
      return data;
    }

    return false;
  }
  ,
  updated: () => false,
  patched: () => false,
  removed: () => false
}
