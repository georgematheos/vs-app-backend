const assert = require('assert');
const formatViewVsRestrictions = require('../../src/hooks/format-view-vs-restrictions');

describe('\'format-view-vs-restrictions\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = formatViewVsRestrictions();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
