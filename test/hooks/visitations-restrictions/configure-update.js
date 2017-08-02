const assert = require('assert');
const configureUpdate = require('../../src/services/visitations-restrictions/hooks/configure-update');

describe('\'configure-update\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureUpdate();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
