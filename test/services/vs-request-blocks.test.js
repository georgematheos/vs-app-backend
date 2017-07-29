const assert = require('assert');
const app = require('../../src/app');

describe('\'vs-request-blocks\' service', () => {
  it('registered the service', () => {
    const service = app.service('vs-request-blocks');

    assert.ok(service, 'Registered the service');
  });
});
