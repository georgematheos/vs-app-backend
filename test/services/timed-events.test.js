const assert = require('assert');
const app = require('../../src/app');

describe('\'timed-events\' service', () => {
  it('registered the service', () => {
    const service = app.service('timed-events');

    assert.ok(service, 'Registered the service');
  });
});
