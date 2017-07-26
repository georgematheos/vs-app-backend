const assert = require('assert');
const formatViewVisitationsQuery = require('../../src/hooks/format-view-visitations-query');

describe('\'format-view-visitations-query\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = formatViewVisitationsQuery();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
