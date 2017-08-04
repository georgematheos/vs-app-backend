const assert = require('assert');
const app = require('../../src/app');

describe('\'visitations-requests\' service', () => {
  it('registered the service', () => {
    const service = app.service('visitations-requests');

    assert.ok(service, 'Registered the service');
  });
});
