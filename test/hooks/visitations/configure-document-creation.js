const assert = require('assert');
const configureDocumentCreation = require('../../src/services/visitations/hooks/configure-document-creation');

describe('\'configure-document-creation\' hook', () => {
  it('runs the hook', () => {
    // A mock hook object
    const mock = {};
    // Initialize our hook with no options
    const hook = configureDocumentCreation();

    // Run the hook function (which returns a promise)
    // and compare the resulting hook object
    return hook(mock).then(result => {
      assert.equal(result, mock, 'Returns the expected hook object');
    });
  });
});
