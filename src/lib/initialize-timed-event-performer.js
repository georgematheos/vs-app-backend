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

  // when we log info about timed events, we could end up with different ones having different numbers for the timerId,
  // which is confusing, so just pull that off the timedEvent object at this point
  let oldTimerId = timedEvent.timerId;
  delete timedEvent.timerId;

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
        });
        // don't delete the timed event here; whatever service performed a request from the timed event
        // should be in charge of deleting the timed event itself, as it will have to delete it if the user
        // performs the action before the server can, anyway
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

  // set a timer for performing this event
  let timeoutIdObj = setTimeout(functionToPerform, millisecondsUntilEvent);

  // if the timed event is occurring within the next tenth of a second, there's no need to store the timer, since it
  // will run out almost immedieatly
  // errors are caused if it
  //if (millisecondsUntilEvent < 100) { return; }

  let timerId = app.get('timerIdConverter').storeTimerIdObject(timeoutIdObj);

  // put the new timer on the timed event service
  app.service('/timed-events').patch(timedEvent._id, { timerId })
  .then(result => {
    console.log('Successfully set timer for a timed event, and added a timerId to the stored version of it. Timed event:');
    console.log(result);
  });
}

module.exports = initializeTimedEventPerformer;
