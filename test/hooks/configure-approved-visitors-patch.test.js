const assert = require('assert');
const configureApprovedVisitorsPatch = require('../../src/hooks/configure-approved-visitors-patch');

describe('\'configure-approved-visitors-patch\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureApprovedVisitorsPatch();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
