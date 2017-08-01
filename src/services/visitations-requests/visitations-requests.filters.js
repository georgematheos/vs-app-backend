/* eslint no-console: 1 */

module.exports = {
  created: (data, connection, hook) => {
    if (connection.user && connection.user.username === data.host.username) {
      return data;
    }
    return false;
  }
  ,
  updated: () => false,
  patched: () => false,
  removed: () => false
}
