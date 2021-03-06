/**
* initialize-all-timed-event-performers
* This function gets all timed event information objects from the database, and sets them all up to
* be performed at the proper time.
* This function takes the api app object as a parameter.
*/

const initializeTimedEventPerformer = require('./initialize-timed-event-performer');

function initializeAllTimedEventPerformers(app) {
  // set this function running with a fake "results" object; it will initialize everything
  return initializePageOfEvents({
    skip: 0,
    total: 1,
    limit: 0,
    data: []
  });

  // this function sets up one page of returned results,
  // and then if not all results were returned on that page,
  // sets up the function to run again on the next page of results
  function initializePageOfEvents(results) {
    // set each timedEvent to be performed at the right time
    for (let timedEvent of results.data) {
      // make sure the timerId is set to a value that is a not a valid timerId (such as `undefined`)
      // to make sure that the timerId is reset, and to make sure it isn't a timerId for some other
      // timer (which can happen after server restarts), since if it is for another timer, that timer
      // would be canceled
      timedEvent.timerId = undefined;
      initializeTimedEventPerformer(app, timedEvent, true);
    }

    // if there are more pages to get, run this function again with the next set of functions
    if (results.total > results.skip + results.limit) {
      return app.service('/timed-events').find({  query: {
        $skip: results.skip + results.limit,
        $limit: 100
      } })
      .then(initializePageOfEvents);
    }
  }
}

module.exports = initializeAllTimedEventPerformers;
