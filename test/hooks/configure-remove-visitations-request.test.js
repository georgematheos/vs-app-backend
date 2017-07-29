const assert = require('assert');
const configureRemoveVisitationsRequest = require('../../src/hooks/configure-remove-visitations-request');

describe('\'configure-remove-visitations-request\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureRemoveVisitationsRequest();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
