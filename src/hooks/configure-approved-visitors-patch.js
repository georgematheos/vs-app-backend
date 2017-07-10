// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* configure-approved-visitors-patch
* This is a hook to be run before a patch request to the approved-visitors service.
* This will set up whatever operation needs to be performed.
* There are two possible operations: `addApprovedVisitor` and `removeApprovedVisitor`
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {

    // depending on the operation to be performed (hook.data.op), we do different things
    switch (hook.data.op) {
      case "addApprovedVisitor":
        // the only person allowed to add an approved visitor is the owner of the approved visitor list
        // check that this is actually that person and deny access if it isn't
        if (hook.params.user.username !== hook.id) {
          return Promise.reject(new errors.Forbidden('only a user with the username ' + hook.id + ' may perform this action'));
        }
        break;

      case "removeApprovedVisitor":
        // the only people allowed to remove an approved visitor is the owner of the approved visitor list or the approved visitor to be removed
        // check that this is actually one of the 2 acceptable people and deny access if it isn't
        if (hook.params.user.username !== hook.id && hook.params.user.username !== hook.data.approvedVisitorUsername) {
          return Promise.reject(new errors.Forbidden('only the user with a username ' + hook.id + ' or ' + hook.data.approvedVisitorUsername + ' may perform this action'));
        }
        break;

      default:
        // if the operation isn't one enumerated above, we don't know how to deal with it, so it is a malformed request
        return Promise.reject(new errors.BadRequest('the provided operation (op) was unrecognized'));
    }

    return Promise.resolve(hook);
  };
};
