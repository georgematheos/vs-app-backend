const assert = require('assert');
const configureAfterCreateVisitationsRequest = require('../../src/hooks/configure-after-create-visitations-request');

describe('\'configure-after-create-visitations-request\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureAfterCreateVisitationsRequest();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
