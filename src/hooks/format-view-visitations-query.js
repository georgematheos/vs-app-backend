/**
* format-view-visitations-query
* This hook formats the query before a request to view visitations objects.
*/

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    if (hook.params.query.onlyShowCurrent) {
      hook.params.query.ongoing = true;
      delete hook.params.query.onlyShowCurrent;
    }

    // no changes needed for dormitory or hostUsername fields

    if (hook.params.query.visitorUsername) {
      // visitor usernames are stored in an object within the visitors array
      hook.params.query.visitors = { $elemMatch: { username: hook.params.query.visitorUsername } };
      delete hook.params.query.visitorUsername;
    }

    if (hook.params.query.earliestStartTime) {
      // only return results where startTime is greater than or equal to earliestStartTime
      hook.params.query.startTime = {
        $gte: hook.params.query.earliestStartTime
      }
      delete hook.params.query.earliestStartTime;
    }

    if (hook.params.query.latestStartTime) {
      // only return results where startTime is less than or equal to latestStartTime
      hook.params.query.startTime = {
        $lte: hook.params.query.latestStartTime
      }
      delete hook.params.query.latestStartTime;
    }
  };
};
