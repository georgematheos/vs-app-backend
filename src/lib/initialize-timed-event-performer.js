/**
* initialize-timed-event-performer
* Given information about a timed event, this function sets a javascript timer that will
* perform the action which must occur for the time it must occur.
* The function takes two parameters.
* The first is the app object.
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
        return app.service(timedEvent.service)[method](parameters)
        .then(results => {
          console.log('Results of the timed event with id ' + timedEvent._id + ':');
          console.log(results);
        })
        // delete the timed event info object
        .then(() => app.service('/timed-events').remove(timedEvent._id))
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

  const currentTime = (new Data()).getTime();
  const millisecondsUntilEvent = timedEvent.time - currentTime;

  setTimeout(functionToPerform, millisecondsUntilEvent);
}
