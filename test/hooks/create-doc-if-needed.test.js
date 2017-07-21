const assert = require('assert');
const createDocIfNeeded = require('../../src/hooks/create-doc-if-needed');

describe('\'create-doc-if-needed\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = createDocIfNeeded();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
