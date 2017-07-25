const assert = require('assert');
const app = require('../../src/app');

describe('\'approved-visitor-addition-blocks\' service', () => {
  it('registered the service', () => {
    const service = app.service('approved-visitor-addition-blocks');

    assert.ok(service, 'Registered the service');
  });
});
