const assert = require('assert');
const app = require('../../src/app');

describe('\'vs-restrictions\' service', () => {
  it('registered the service', () => {
    const service = app.service('vs-restrictions');

    assert.ok(service, 'Registered the service');
  });
});
