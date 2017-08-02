/**
* send-patch-visitations-events
* After a patch event, checks what the performed op was, and if needed, emits an event or events.
*/

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    // if no op is on the params, we don't do anything in this hook
    if (!hook.params.op) { return hook; }

    switch (hook.params.op) {
      case 'removeVisitor':
        hook.service.emit('visitorRemoved', {
          hostUsername: hook.result.host.username,
          removedVisitorUsername: hook.params.removedVisitorUsername
        });
        break;

      case 'endVisitations':
        console.log(hook.params.visitorsToRemoveUsernames);
        for (let visitorUsername of hook.params.visitorsToRemoveUsernames) {
          hook.service.emit('visitorRemoved', {
            removedVisitorUsername: visitorUsername,
            visitationsId: hook.result.id
          });
        }
        break;
    }
  };
};
