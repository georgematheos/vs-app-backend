// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* configure-add-remove-patch
* This is a hook to be run before a patch request to a service
* that can either be used to add or remove an object from an array.
* This will set up whatever operation needs to be performed.
* There are two possible operations, one to add and one to remove.
* This file contains the code to handle either of these requests.
* The options object contains the following fields:
*/

const errors = require('feathers-errors');

// the fields which must be included in the options object
const REQUIRED_OPTIONS_FIELDS = [
  'serviceName',
  'addOp',
  'operatorUsernameFieldName',
  'operateeUsernameFieldName',
  'operateeListFieldName',
  'operatorDescription',
  'operateeDescription',
]

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // make sure all required fields were included in the options object
    for (let requiredField of REQUIRED_OPTIONS_FIELDS) {
      if (!options[requiredField]) {
        throw new errors.GeneralError('Server-side error: the field ' + requiredField + ' was not included in the options object passed to the configure-add-remove-patch hook, but it must be.');
      }
    }

    // a few checks to ensure valid request format
    if (!hook.id) {
      throw new errors.BadRequest('the username of the ' + options.operatorDescription + ' must be provided in the URL');
    }

    if (!hook.data.op) {
      throw new errors.BadRequest('the field `op` must be included in the request body');
    }

    if (!hook.data[options.operateeUsernameFieldName]) {
      throw new errors.BadRequest('the request body for this operation must include a field called `' + options.operateeUsernameFieldName + '` specifying the username of the user to add or remove as a(n) ' + options.operateeDescription);
    }

    const operatorUsername = hook.id;
    const operateeUsername = hook.data[options.operateeUsernameFieldName];
    const service = hook.app.service(options.serviceName);

    // depending on the operation to be performed (hook.data.op), we do different things
    switch (hook.data.op) {
      case options.addOp:
        // the only person allowed to add to this list is the owner of the list
        // check that this is actually that person and deny access if it isn't
        if (hook.params.user.username !== operatorUsername) {
          throw new errors.NotAuthenticated('only a user with the username `' + operatorUsername + '` may perform this action');
        }

        // make sure user isn't trying to add themself
        if (operateeUsername === operatorUsername) {
          throw new errors.Forbidden('the user with the username `' + operatorUsername + '` may not add themself as a(n) ' + options.operateeDescription);
        }

        // a few variables
        let createNewList = false; // whether we'll need to create a new list
        let list = []; // the list (to fill in later)

        // find the info on the list owner specified in the URL
        let queryObject = {};
        queryObject[options.operatorUsernameFieldName] = operatorUsername;
        return service.find({ query: queryObject })
        .then(results => {
          // if no entry exists in the database for this user, note that we will have to create one
          if (results.total === 0) {
            createNewList = true;
          }
          // if an entry was returned, make note of the data
          else {
            list = results.data[0][options.operateeListFieldName];

            // check that the person to add isn't already an approved visitor for the list owner
            // if they are, throw an error
            if (list.includes(operateeUsername)) {
              throw new errors.Conflict('the user with username `' + operateeUsername + '` is already a(n) ' + options.operateeListFieldName + ' for the user with username `' + operatorUsername + '`');
            }
          }

          return hook;
        })
        /* make sure operateeUsername is valid for some user (who is a student) */
        .then(hook => {
          const users = hook.app.service('/users');
          return users.find({ query: { username: operateeUsername } })
          .then(results => {
            // if no such user found
            if (results.total === 0) {
              throw new errors.NotFound('no user with the username `' + operateeUsername + '` was found');
            }
            // if the user found isn't a student
            if (!results.data[0].isStudent) {
              throw new errors.Forbidden('the user with the username `' + operateeUsername + '` may not be added as a(n) ' + options.operateeDescription + ' because they are not a student');
            }

            return hook;
          });
        })
        /* create a new list if necessary */
        .then(hook => {
          // only run this hook if we need to create a new list, so exit it if we don't
          if (!createNewList) {
            return hook;
          }

          // create an empty list
          let creationParams = {};
          creationParams[options.operatorUsernameFieldName] = hook.id;
          creationParams[options.operateeListFieldName] = [ ] // empty list for now
          return service.create(creationParams)
          .then(results => hook); // make sure the hook object enters next .then
        })
        /* configure hook object with properly formatted patch request data */
        .then(hook => {
          // add the new username to the list
          list.push(operateeUsername);

          hook.data = {};
          hook.data[options.operateeListFieldName] = list;
        });

      case "removeApprovedVisitor":
        // the only people allowed to remove an approved visitor is the owner of the approved visitor list or the approved visitor to be removed
        // check that this is actually one of the 2 acceptable people and deny access if it isn't
        if (hook.params.user.username !== operatorUsername && hook.params.user.username !== operateeUsername) {
          throw new errors.NotAuthenticated('only the user with a username `' + operatorUsername + '` or `' + operateeUsername + '` may perform this action');
        }

        // if we get here, it is valid for this user to be making this request
        return approvedVisitors.find({ query: { listOwnerUsername: operatorUsername } })
        .then(results => {
          // some variables
          let resultsFound;
          let approvedVisitorsList = [];
          let index = -1;

          if (results.total === 0) {
            resultsFound = false;
          }
          else {
            resultsFound = true;
            approvedVisitorsList = results.data[0].approvedVisitors;

            // find where in the list the username to remove is
            index = approvedVisitorsList.indexOf(operateeUsername);
          }

          // if no approved visitor list exists for the list owner,
          // or the operateeUsername is not in the list, send an error
          if (index < 0 || !resultsFound) {
            throw new errors.NotFound('the user with the username `' + operateeUsername + '` was not an approved visitor for the user with the username `' + operatorUsername + '` , and thus could not be removed');
          }

          // remove the proper value from the approved visitors list
          approvedVisitorsList.splice(index, 1);

          // format the PATCH request properly
          hook.data = { approvedVisitors: approvedVisitorsList };
        });

      default:
        // if the operation isn't one enumerated above, we don't know how to deal with it, so it is unprocessable
        throw new errors.Unprocessable('the provided operation (op: `' + hook.data.op + '`) was not recognized');
    }
  };
};
