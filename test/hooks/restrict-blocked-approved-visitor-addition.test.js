const assert = require('assert');
const restrictBlockedApprovedVisitorAddition = require('../../src/hooks/restrict-blocked-approved-visitor-addition');

describe('\'restrict-blocked-approved-visitor-addition\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = restrictBlockedApprovedVisitorAddition();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
