const assert = require('assert');
const configureRemove = require('../../src/services/visitations-requests/hooks/configure-remove');

describe('\'configure-remove\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureRemove();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
