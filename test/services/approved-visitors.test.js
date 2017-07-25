const assert = require('assert');
const app = require('../../src/app');

describe('\'approved-visitors\' service', () => {
  it('registered the service', () => {
    const service = app.service('approved-visitors');

    assert.ok(service, 'Registered the service');
  });
});
