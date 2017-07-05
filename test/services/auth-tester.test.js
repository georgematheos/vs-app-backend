const assert = require('assert');
const app = require('../../src/app');

describe('\'auth-tester\' service', () => {
  it('registered the service', () => {
    const service = app.service('auth-tester');

    assert.ok(service, 'Registered the service');
  });
});
