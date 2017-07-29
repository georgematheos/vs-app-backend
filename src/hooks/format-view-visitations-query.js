/**
* format-view-visitations-query
* This hook formats the query before a request to view visitations objects.
*/

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if this property is true, data for visitors other than the authenticated user is removed
    // from returned visitations sessions where the authenticated user isn't a host
    // start assuming we won't have to do this; overwrite property if we do
    hook.params.removeVisitorDataIfNotHost = false;

    // if the user making the request is a student, only show Vs sessions they were host for,
    // or Vs sessions they were visitors in, but with other visitor data stripped away
    if (hook.params.user.isStudent) {
      // note that we should remove data for visitors other than the authenticated user
      // for Vs sessions where the authenticated user isn't host (this will be done in an after hook)
      hook.params.removeVisitorDataIfNotHost = true;
      // only return Vs sessions where this user was host or a visitor
      hook.params.query.$or = [
        { hostUsername: hook.params.user.username },
        { visitors: { $elemMatch: { username: hook.params.user.username } } }
      ]
    }
    // if the user is a faculty member but not a dean, only show Vs that occurred in their dormitory
    // throw error if they have no dorm affiliation
    else if (!hook.params.user.isStudent && !hook.params.user.isDean) {
      if (!hook.params.user.dormitory) {
        throw new errors.NotAuthenticated('Faculty members may only make this request if they are deans or are affiliated with a dormitory.');
      }
      hook.params.query.dormitory = hook.params.user.dormitory;
    }
    // the only not checked case is for a faculty member who is a dean, and in this case,
    // they can see all Vs, so no restrictions need to be added

    if (hook.params.query.onlyShowCurrent) {
      hook.params.query.ongoing = true;
      delete hook.params.query.onlyShowCurrent;
    }

    // no changes needed for hostUsername field
    // dormitory field was either included or added/overwritten by auth checking above,
    // so no further modification necessary

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

    // order the search results in reverse chronological order by start time
    hook.params.query.$sort = { startTime: -1 }
  };
};
