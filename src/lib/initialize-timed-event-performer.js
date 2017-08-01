/**
* initialize-timed-event-performer
* Given information about a timed event, this function sets a javascript timer that will
* perform the action which must occur for the time it must occur.
* The function takes two parameters.
* The first is the api app object.
* The second is the timedEvent object, which should be formatted as specified in
* `storage-formats.md`, including an _id field.
*/

function initializeTimedEventPerformer(app, timedEvent) {
  let functionToPerform;
  switch (timedEvent.type) {
    // perform a REST service method
    case 1:
      functionToPerform = () => {
        console.log('Performing a timed event.  Timed event info:');
        console.log(timedEvent);
        // perform the method
        return app.service(timedEvent.service)[timedEvent.method](...timedEvent.parameters)
        // log info about the result of this event
        .then(results => {
          console.log('Results of the timed event with id ' + timedEvent._id + ':');
          console.log(results);
        })
        // if a 404 error is thrown, it means the document to modify in some way was not found
        // this is probably okay, and probably just means the document was deleted since this
        // timed event was created
        // send a message about it, but don't throw the error
        .catch(err => {
          if (err.code !== 404) { throw err }; // if this isn't a 404, it's unexpected, so throw error
          console.log('A not found error occurred while attempting to perform the following timed event:');
          console.log(timedEvent);
          console.log('Here are the details of the error:');
          console.log(err);
          console.log('It will be assumed that this is just because the resource to be modified has been deleted since this timed event was created, and that this is an expected behavior.');
        })
        // delete the timed event info object
        .then(() => app.service('/timed-events').remove(timedEvent._id, {}))
        .then(results => {
          console.log('Results of deleting the timed event information object with id ' + timedEvent._id + ':');
          console.log(results);
        });
      }
      break;

    // unknown event type
    default:
      console.log('The following timed event contains an unrecognized type, and therefore cannot be performed:');
      console.log(timedEvent);
      console.log('This timed event will not be performed or deleted at the time specified.');
      return;
  }

  const currentTime = (new Date()).getTime();
  let millisecondsUntilEvent = timedEvent.time - currentTime;

  // if this event was supposed to have already happened, set it to happen right now
  if (millisecondsUntilEvent < 0) {
    millisecondsUntilEvent = 0;
  };

  // if there was previously a timer for this timed event, cancel it
  if (timedEvent.timerId) {
    let timeoutIdObj = app.get('timerIdConverter').getTimerIdObject(timedEvent.timerId);
    if (timeoutIdObj) {
      clearTimeout(timeoutIdObj);
    }
  }

  // set a timer for performing this event
  let timeoutIdObj = setTimeout(functionToPerform, millisecondsUntilEvent);
  let timerId = app.get('timerIdConverter').storeTimerIdObject(timeoutIdObj);

  // put the new timer on the timed event service
  app.service('/timed-events').patch(timedEvent._id, { timerId })
  .then(result => {
    console.log('Successfully set timer for a timed event, and added a timerId to the stored version of it. Timed event:');
    console.log(result);
  });
}

module.exports = initializeTimedEventPerformer;
