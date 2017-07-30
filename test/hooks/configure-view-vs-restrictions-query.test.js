const assert = require('assert');
const configureViewvisitationsRestrictionsQuery = require('../../src/hooks/configure-view-visitations-restrictions-query');

describe('\'configure-view-visitations-restrictions-query\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureViewvisitationsRestrictionsQuery();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
