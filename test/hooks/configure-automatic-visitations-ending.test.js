const assert = require('assert');
const configureAutomaticVisitationsEnding = require('../../src/hooks/consigure-automatic-visitations-ending');

describe('\'configure-automatic-visitation-ending\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureAutomaticVisitationsEnding();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
