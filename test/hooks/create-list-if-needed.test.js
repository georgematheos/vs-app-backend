const assert = require('assert');
const createListIfNeeded = require('../../src/hooks/create-list-if-needed');

describe('\'create-list-if-needed\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = createListIfNeeded();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
