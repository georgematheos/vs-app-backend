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

        // if we get here, it is valid for this user to make this request

        // a few variables
        let createNewList = false; // whether we'll need to create a new approved visitors list
        let approvedVisitorsListId; // the ID of the list data we're going to modify with the PATCH request
        let approvedVisitorsList = []; // the list of approved visitors (to fill in later)

        const approvedVisitors = hook.app.service('approved-visitors');

        // find the info on the list owner specified in the URL
        return approvedVisitors.find({ listOwnerUsername: hook.id })
        .then(results => {
          // if no entry exists in the database for this user, note that we will have to create one
          if (results.total === 0) {
            createNewList = true;
          }
          // if an entry was returned, this is the approved visitor list data, so make note of the ID and data
          else {
            approvedVisitorsListId = results.data[0]._id;
            console.log('yup');
            console.log(results);
            approvedVisitorsList = results.data[0].approvedVisitors;
            console.log(approvedVisitorsList)
          }

          return hook;
        })
        .then(hook => { // CREATE NEW LIST IF NECESSARY
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
        .then(hook => {
          // add the new approved visitor to the list of approved visitors
          approvedVisitorsList.push(hook.data.approvedVisitorUsername);

          // set the ID of the entity to be modified, and the data to modify it with, to the correct values
          hook.id = approvedVisitorsListId;
          hook.data = { approvedVisitors: approvedVisitorsList }
        });

        // no need for a break; statement since we have already returned something

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
