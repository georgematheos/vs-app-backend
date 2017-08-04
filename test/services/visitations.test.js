const assert = require('assert');
const app = require('../../src/app');

describe('\'visitations\' service', () => {
  it('registered the service', () => {
    const service = app.service('visitations');

    assert.ok(service, 'Registered the service');
  });
});
