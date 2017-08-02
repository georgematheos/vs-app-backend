const assert = require('assert');
const sendPatchVisitationsEvents = require('../../src/hooks/send-patch-visitations-events');

describe('\'send-patch-visitations-events\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = sendPatchVisitationsEvents();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
