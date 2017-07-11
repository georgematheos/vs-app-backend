// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* configure-approved-visitors-patch
* This is a hook to be run before a patch request to the approved-visitors service.
* This will set up whatever operation needs to be performed.
* There are two possible operations: `addApprovedVisitor` and `removeApprovedVisitor`.
* This file contains the code to handle either of these requests.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // a few checks to ensure valid request format
    if (!hook.id) {
      throw new errors.BadRequest('the username of the list owner (the person for whom an approved visitor should be added or removed) must be provided in the URL');
    }

    if (!hook.data.op) {
      throw new errors.BadRequest('the field `op` must be included in the request body');
    }

    if (!hook.data.approvedVisitorUsername) {
      throw new errors.BadRequest('the request body for this operation must include a field called `approvedVisitorUsername` specifying the username of the user to add or remove as an approved visitor');
    }

    const listOwnerUsername = hook.id;
    const approvedVisitorUsername = hook.data.approvedVisitorUsername;
    const approvedVisitors = hook.app.service('approved-visitors');

    // depending on the operation to be performed (hook.data.op), we do different things
    switch (hook.data.op) {
      case "addApprovedVisitor":
        // the only person allowed to add an approved visitor is the owner of the approved visitor list
        // check that this is actually that person and deny access if it isn't
        if (hook.params.user.username !== listOwnerUsername) {
          throw new errors.NotAuthenticated('only a user with the username `' + hook.id + '` may perform this action');
        }

        // make sure user isn't trying to add themself as an approved visitor
        if (approvedVisitorUsername === listOwnerUsername) {
          throw new errors.Forbidden('the user with the username `' + listOwnerUsername + '` may not add themself as an approved visitor');
        }

        // a few variables
        let createNewList = false; // whether we'll need to create a new approved visitors list
        let approvedVisitorsListId; // the ID of the list data we're going to modify with the PATCH request
        let approvedVisitorsList = []; // the list of approved visitors (to fill in later)

        // find the info on the list owner specified in the URL
        return approvedVisitors.find({ query: { listOwnerUsername: listOwnerUsername } })
        .then(results => {
          // if no entry exists in the database for this user, note that we will have to create one
          if (results.total === 0) {
            createNewList = true;
          }
          // if an entry was returned, this is the approved visitor list data, so make note of the ID and data
          else {
            approvedVisitorsListId = results.data[0]._id;
            approvedVisitorsList = results.data[0].approvedVisitors;

            // check that the person to add isn't already an approved visitor for the list owner
            // if they are, throw an error
            if (approvedVisitorsList.includes(approvedVisitorUsername)) {
              throw new errors.Conflict('the user with username `' + approvedVisitorUsername + '` is already an approved visitor for the user with username `' + listOwnerUsername + '`');
            }
          }

          return hook;
        })
        /* make sure approvedVisitorUsername is valid for some user */
        .then(hook => {
          const users = hook.app.service('/users');
          return users.find({ query: { username: approvedVisitorUsername } })
          .then(results => {
            console.log(results);
            if (results.total === 0) {
              throw new errors.NotFound('no user with the username `' + approvedVisitorUsername + '` was found');
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
          return approvedVisitors.create({
            listOwnerUsername: hook.id,
            approvedVisitors: [ ] // empty list for now
          })
          .then(results => {
            approvedVisitorsListId = results._id; // the id of the approved visitor list is that of the one just created

            return hook;
          });
        })
        /* configure hook object with properly formatted patch request */
        .then(hook => {
          // add the new approved visitor to the list of approved visitors
          approvedVisitorsList.push(approvedVisitorUsername);

          // set the ID of the entity to be modified, and the data to modify it with, to the correct values
          hook.id = approvedVisitorsListId;
          hook.data = { approvedVisitors: approvedVisitorsList }
        });

      case "removeApprovedVisitor":
        // the only people allowed to remove an approved visitor is the owner of the approved visitor list or the approved visitor to be removed
        // check that this is actually one of the 2 acceptable people and deny access if it isn't
        if (hook.params.user.username !== hook.id && hook.params.user.username !== hook.data.approvedVisitorUsername) {
          throw new errors.NotAuthenticated('only the user with a username `' + hook.id + '` or `' + hook.data.approvedVisitorUsername + '` may perform this action');
        }

        // if we get here, it is valid for this user to be making this request
        return approvedVisitors.find({ query: { listOwnerUsername: listOwnerUsername } })
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
            index = approvedVisitorsList.indexOf(approvedVisitorUsername);
          }

          // if no approved visitor list exists for the list owner,
          // or the approvedVisitorUsername is not in the list, send an error
          if (index < 0 || !resultsFound) {
            throw new errors.NotFound('the user with the username `' + approvedVisitorUsername + '` was not an approved visitor for the user with the username `' + listOwnerUsername + '` , and thus could not be removed');
          }

          // remove the proper value from the approved visitors list
          approvedVisitorsList.splice(index, 1);

          // format the PATCH request properly
          hook.id = results.data[0]._id;
          hook.data = { approvedVisitors: approvedVisitorsList };
        });

      default:
        // if the operation isn't one enumerated above, we don't know how to deal with it, so it is unprocessable
        throw new errors.Unprocessable('the provided operation (op: `' + hook.data.op + '`) was not recognized');
    }
  };
};
