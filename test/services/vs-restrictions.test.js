const assert = require('assert');
const app = require('../../src/app');

describe('\'visitations-restrictions\' service', () => {
  it('registered the service', () => {
    const service = app.service('visitations-restrictions');

    assert.ok(service, 'Registered the service');
  });
});
