const assert = require('assert');
const restrictToUserType = require('../../src/hooks/restrict-to-user-type');

describe('\'restrictToUserType\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = restrictToUserType();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
