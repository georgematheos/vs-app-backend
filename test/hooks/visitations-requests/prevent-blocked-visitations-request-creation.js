const assert = require('assert');
const preventBlockedVisitationsRequestCreation = require('../../src/services/visitations-requests/hooks/prevent-blocked-visitations-request-creation');

describe('\'prevent-blocked-visitations-request-creation\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = preventBlockedVisitationsRequestCreation();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
