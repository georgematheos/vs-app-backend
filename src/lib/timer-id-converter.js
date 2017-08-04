/**
* timer-id-converter
* An object with a few functions for converting timeout ID objects to numerical IDs that can be stored
* in a database.
* The two useful functions on the object are:
* getTimerIdObject(timerId) - given a numerical timer id, returns the timeout ID object
* storeTimerIdObject(timerIdObject) - given the a timeout id object, stores it and returns a numerical
* timer id
*/

let timerIdConverter = {};
timerIdConverter.storage = {};
timerIdConverter.counter = 0;

function getTimerIdObject(timerId) {
    return timerIdConverter.storage[timerId];
}

function storeTimerIdObject(timerIdObj) {
    timerIdConverter.counter++;
    timerIdConverter.storage[timerIdConverter.counter] = timerIdObj;
    return timerIdConverter.counter;
}

timerIdConverter.getTimerIdObject = getTimerIdObject;
timerIdConverter.storeTimerIdObject = storeTimerIdObject;

module.exports = timerIdConverter;
