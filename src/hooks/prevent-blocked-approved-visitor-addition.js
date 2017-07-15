// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

/**
* prevent-blocked-approved-visitor-addition
* This hook will throw an error if the operator is blocked by the operatee from adding them as an approved visitor.
*/

const errors = require('feathers-errors');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // this hook should only be run if the operation is 'add', so if it isn't just return the hook object
    if (hook.params.op !== 'add') { return hook; }

    // check the approved visitor block list for the operatee
    return hook.app.service('/approved-visitor-addition-blocks')
    .find({ query: { blockerUsername: hook.params.operateeUsername } })
    .then(results => {
      // if this user has a block list, and it includes the operator, throw an error
      if (results.total !== 0 && results.data[0].blockees.includes(hook.params.ownerUsername)) {
        throw new errors.Forbidden('The user with the username `' + hook.params.operateeUsername + '` has blocked the user with the username `' + hook.params.ownerUsername + '` from adding them as an approved visitor.');
      }

      // if no error, just return the hook
      return hook;
    });
  };
};
