/**
* configure-automatic-visitation-ending
* Configures a timed event to automatically have the visitations session end at the end of the day.
*/

const { getTodaysVisitationsEnd } = require('../lib/visitations-scheduling');
const initializeTimedEventPerformer = require('../lib/initialize-timed-event-performer');

module.exports = function (options = {}) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const millisecondsInMinute = 1000 * 60;

    // event will occur 15 minutes after visitations sessions are done for the day
    const eventTime = getTodaysVisitationsEnd() + (15 * millisecondsInMinute);

    hook.app.service('/timed-events')
    .create({
      type: 1,
      time: eventTime,
      service: 'visitations',
      method: 'patch',
      parameters: [ hook.result.id, {
        'op': 'endVisitations'
      }]
    })
    .then(result => {
      initializeTimedEventPerformer(hook.app, result);
    });

    return hook;
  };
};
