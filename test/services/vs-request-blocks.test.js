const assert = require('assert');
const app = require('../../src/app');

describe('\'visitations-request-blocks\' service', () => {
  it('registered the service', () => {
    const service = app.service('visitations-request-blocks');

    assert.ok(service, 'Registered the service');
  });
});
