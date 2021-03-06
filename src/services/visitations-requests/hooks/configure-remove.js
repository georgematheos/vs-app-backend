/**
* visitations-requests/hooks/configure-remove
* This configures the removal of the visitations request, including accepting or denying the request,
* if that is what should be done.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // get the vs request to be removed
    return hook.service.get(hook.id, {})
    .then(result => {
      // make sure the user performing this request is allowed to
      if (hook.params.user.username !== result.hostUsername && hook.params.user.username !== result.visitorUsername) {
        throw new errors.NotAuthenticated('The authenticated user may not perform this action.');
      }

      // put this on the params object so we can access it in an after hook
      hook.params.expirationTimedEventId = result.expirationTimedEventId;

      // whether the host is responding (alternatively, it could be the visitor deleting the request)
      const hostIsResponding = hook.params.user.username === result.hostUsername;

      // if the visitor is the one deleting the request, all there is to do is delete it,
      // so return the hook obj and leave this function
      if (!hostIsResponding) {
        delete hook.params.query; // don't let query interfere with locating doc to delete
        return hook;
      }

      // if we get here, the host is responding to the request

      // if the host is accepting the request, have the visitor join Vs with them
      if (hook.params.query.acceptRequest === true || hook.params.query.acceptRequest === 'true') {
        return hook.app.service('/visitations').create({
          hostUsername: result.hostUsername,
          visitorUsername: result.visitorUsername
        }).then(results => {
          // don't continue with the delete request; it will be deleted when visitations are created
          // by a hook on that service
          // instead just return the result of this visitor joining Vs
          hook.result = results;
          return hook;
        });
      }

      // if the host isn't accepting the request, all we have to do is delete the Vs request,
      // so just return the hook object

      delete hook.params.query; // don't let query interfere with locating doc to delete
      return hook;
    });
  };
};
