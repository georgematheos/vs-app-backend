// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* configure-add-remove-patch
* This is a hook to be run before a patch request to a service
* that can either be used to add or remove an object from an array.
* This will set up whatever operation needs to be performed.
* There are two possible operations, one to add and one to remove.
* This file contains the code to handle either of these requests.
* The options object MUST contain certain fields.
* For these fields and their descriptions, see the declaration of REQUIRED_OPTIONS_FIELDS below.
* Note that this hook also puts the following fields on the hook.params object:
* `ownerUsername` - the username of the list owner
*`operateeUsername` - the username of the person to be added or removed from the list
* `op` - either 'add', 'remove', (or undefined, but in this situation, this hook should throw an error), depending on whether someone is being added or removed from the hook
*/

const REQUIRED_OPTIONS_FIELDS = [ // the following fields MUST be inluded in the options object
  'addOp', // the value of `op` for the add operation
  'removeOp', // the value of `op` for the remove operation
  'ownerUsernameFieldName', // the name of the field for the owner's username
  'operateeUsernameFieldName', // the name of the field for the operatee's username
  'operateeListFieldName', // the name of the field for the list of operatees
  'ownerDescription', // the description, INCLUDING an article, of the owner (ex. "the list owner")
  'operateeDescription', // the description, INCLUDING an article, of the operatee (ex. "an approved visitor")
  'operateeMayPerformAdd', // a boolean; true if the operatee may add themself to this list
  'operateeMayPerformRemove' // a boolean; true if the operatee may remove themself from this list
];

const OPTIONAL_OPTIONS_FIELDS = [ // these fields MAY be included in the options object, but do not have to
  // an array of validType objects (see `src/lib/user-is-valid-type`)
  // if this field is included, this hook will only allow users who are of one of the types
  // specified to be added to the list as an operatee
  'validOperateeTypes'
];

const errors = require('feathers-errors');
const userIsValidType = require('../lib/user-is-valid-type');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // make sure all required fields were included in the options object
    for (let requiredField of REQUIRED_OPTIONS_FIELDS) {
      if (!(requiredField in options)) {
        throw new errors.GeneralError('Server-side error: the field `' + requiredField + '` was not included in the options object passed to the configure-add-remove-patch hook, but it must be.');
      }
    }

    // a few checks to ensure valid request format
    if (!hook.id) {
      throw new errors.BadRequest('the username of ' + options.ownerDescription + ' must be provided in the URL');
    }

    if (!hook.data.op) {
      throw new errors.BadRequest('the field `op` must be included in the request body');
    }

    if (!hook.data[options.operateeUsernameFieldName]) {
      throw new errors.BadRequest('the request body for this operation must include a field called `' + options.operateeUsernameFieldName + '` specifying the username of the user to add or remove as ' + options.operateeDescription);
    }

    const ownerUsername = hook.id;
    const operateeUsername = hook.data[options.operateeUsernameFieldName];
    const service = hook.service;

    // note in the hook who the operator and operatee are so future hooks can use this data
    hook.params.ownerUsername = ownerUsername;
    hook.params.operateeUsername = operateeUsername;
    if (hook.data.op === options.addOp) { hook.params.op = 'add' };
    if (hook.data.op === options.removeOp) { hook.params.op = 'remove' };

    // depending on the operation to be performed (hook.data.op), we do different things
    switch (hook.data.op) {
      case options.addOp:
        // check that this is owner of the list
        // (or the operatee, if they are allowed to perform the add operation),
        // and deny access if it isn't
        // NOTE: this could be done with the restrict-to-users hook, but setting it up is not much simpler
        // than just performing the check here
        if (!((hook.params.user.username === ownerUsername) ||
        (options.operateeMayPerformAdd && hook.params.user.username === operateeUsername))) {
          throw new errors.NotAuthenticated('only a user with the username `' + ownerUsername + ((options.operateeMayPerformAdd) ? ('` or `' + operateeUsername) : '') + '` may perform this action');
        }

        // make sure user isn't trying to add themself
        if (operateeUsername === ownerUsername) {
          throw new errors.Forbidden('the user with the username `' + ownerUsername + '` may not add themself as ' + options.operateeDescription);
        }

        // a few variables
        let createNewList = false; // whether we'll need to create a new list
        let list = []; // the list (to fill in later)

        // find the info on the list owner specified in the URL
        var queryObject = {};
        queryObject[options.ownerUsernameFieldName] = ownerUsername;
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
              throw new errors.Conflict('the user with username `' + operateeUsername + '` is already ' + options.operateeDescription + ' for the user with username `' + ownerUsername + '`');
            }
          }

          return hook;
        })
        /* make sure operateeUsername is valid for some user (who is a valid type, if valid types are specified) */
        .then(hook => {
          const users = hook.app.service('/users');
          return users.find({ query: { username: operateeUsername } })
          .then(results => {
            // if no such user found
            if (results.total === 0) {
              throw new errors.NotFound('no user with the username `' + operateeUsername + '` was found');
            }

            // if only certain types of users may be operatees, make sure this user is a valid type
            if (options.validOperateeTypes) {
              // if this field is included but not an array, throw descriptive error
              if (options.validOperateeTypes.constructor !== Array) {
                throw new errors.GeneralError('Server-side error: the validOperateeTypes option passed to the configure-add-remove-patch hook must be an array.');
              }

              // if the user isn't a valid type, throw an error
              if (!userIsValidType(results.data[0], options.validOperateeTypes)) {
                throw new errors.Forbidden('the user with the username `' + operateeUsername + '` may not be added as ' + options.operateeDescription + ' because they are not of a valid type.');
              }
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
          creationParams[options.ownerUsernameFieldName] = hook.id;
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

      case options.removeOp:
      // check that this is owner of the list
      // (or the operatee, if they are allowed to perform the remvoe operation),
      // and deny access if it isn't
      if (!((hook.params.user.username === ownerUsername) ||
      (options.operateeMayPerformRemove && hook.params.user.username === operateeUsername))) {
        throw new errors.NotAuthenticated('only a user with the username `' + ownerUsername + ((options.operateeMayPerformRemove) ? ('` or `' + operateeUsername) : '') + '` may perform this action');
      }

        // if we get here, it is valid for this user to be making this request

        // search database for the document
        queryObject = {};
        queryObject[options.ownerUsernameFieldName] = ownerUsername;
        return service.find({ query: queryObject })
        .then(results => {
          // some variables
          let resultsFound;
          let list = [];
          let index = -1;

          if (results.total === 0) {
            resultsFound = false;
          }
          else {
            resultsFound = true;
            list = results.data[0][options.operateeListFieldName];

            // find where in the list the username to remove is
            index = list.indexOf(operateeUsername);
          }

          // if no document exists for the list owner,
          // or the operateeUsername is not in the list, send an error
          if (index < 0 || !resultsFound) {
            throw new errors.NotFound('the user with the username `' + operateeUsername + '` was not ' + options.operateeDescription + ' for the user with the username `' + ownerUsername + '` , and thus could not be removed');
          }

          // remove the proper value from the list
          list.splice(index, 1);

          // format the PATCH request properly
          hook.data = {};
          hook.data[options.operateeListFieldName] = list;
        });

      default:
        // if the operation isn't one enumerated above, we don't know how to deal with it, so it is unprocessable
        throw new errors.Unprocessable('the provided operation (op: `' + hook.data.op + '`) was not recognized');
    }
  };
};
