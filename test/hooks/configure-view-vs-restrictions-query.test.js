const assert = require('assert');
const configureViewVsRestrictionsQuery = require('../../src/hooks/configure-view-vs-restrictions-query');

describe('\'configure-view-vs-restrictions-query\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureViewVsRestrictionsQuery();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
