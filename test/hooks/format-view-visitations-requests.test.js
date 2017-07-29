const assert = require('assert');
const formatViewVisitationsRequests = require('../../src/hooks/format-view-visitations-requests');

describe('\'format-view-visitations-requests\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = formatViewVisitationsRequests();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
