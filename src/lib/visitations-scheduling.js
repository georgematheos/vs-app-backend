/**
* visitations-scheduling
* This module includes a variety of functions and objects related to knowing when visitations are
* allowed.
* The following items are included:
* `SCHEDULES` - an object with a few schedule info items; see its declaration below for more info
* `getTodaysSchedule` - returns the schedule for the time when it is called
* `visitationsCurrentlyAllowed` - returns true if visitations are currently allowed, false otherwise
* `getTodaysVisitationsStart` - returns (in epoch time) the time when visitations are first allowed
* today
* `getTodaysVisitationsEnd` - returns (in epoch time) the time when visitations are last allowed today
*/

const millisecondsInMinute = 1000 * 60;
const millisecondsInHour = millisecondsInMinute * 60;
const millisecondsInDay = millisecondsInHour * 24;
const millisecondsInWeek = millisecondsInDay * 7;

// standard Vs schedules
// each is an object with a start and end time, where the start is the earliest time Vs are allowed,
// and end is the latest time
// times are represented as milliseconds since the start of the day
const SCHEDULES = {
  weekday: {
      start: (10 * millisecondsInHour) + (45 * millisecondsInMinute), // 10:45 AM
      end: (20 * millisecondsInHour) // 8:00 PM (20:00 military time)
  },
  friday: {
      start: (10 * millisecondsInHour) + (45 * millisecondsInMinute), // 10:45 AM
      end: (21 * millisecondsInHour) + (45 * millisecondsInMinute) // 9:45 PM (21:45 military time)
  },
  saturday: {
      start: (12 * millisecondsInHour), // 12:00 PM (12:00 military time)
      end: (22 * millisecondsInHour) + (45 * millisecondsInHour) // 10:45 PM (22:45 military time)
  },
  sunday: {
      start: (12 * millisecondsInHour), // 12:00 PM (12:00 military time)
      end: (20 * millisecondsInHour) // 8:00 PM (20:00 military time)
  }
};

// private function for returning information about the current time
function getCurrentTimeInfo() {
  const currentTime = new Date();
  const offsetMilliseconds = (new Date()).getTimezoneOffset() * millisecondsInMinute;

  // date object for the current time in local time zone
  const currentDay = currentTime.getDay();
  const timeSinceDayStart = (currentTime.getTime() - offsetMilliseconds) % millisecondsInDay;
  const todayStartTime = currentTime.getTime() - timeSinceDayStart;

  return {
    currentTime,
    currentDay,
    timeSinceDayStart,
    todayStartTime
  };
}

function getTodaysSchedule() {
  let { currentDay } = getCurrentTimeInfo();

  if (1 <= currentDay <= 4) {
    return SCHEDULES.weekday;
  }
  // friday
  else if (currentDay === 5) {
    return SCHEDULES.friday;
  }
  // saturday
  else if (currentDay === 6) {
    return SCHEDULES.saturday;
  }
  // sunday
  else if (currentDay === 0) {
    return SCHEDULES.sunday;
  }
}

function visitationsCurrentlyAllowed() {
  let schedule = getTodaysSchedule();
  let { timeSinceDayStart } = getCurrentTimeInfo();
    // if this is a monday, tuesday, wednesday, or thursday
  return timeSinceDayStart >= schedule.start && timeSinceDayStart <= schedule.end;
}

function getTodaysVisitationsStart() {
  let { todayStartTime } = getCurrentTimeInfo();
  return todayStartTime + getTodaysSchedule().start;
}

function getTodaysVisitationsEnd() {
  let { todayStartTime } = getCurrentTimeInfo();
  return todayStartTime + getTodaysSchedule().end;
}

module.exports = {
  SCHEDULES,
  getTodaysSchedule,
  visitationsCurrentlyAllowed,
  getTodaysVisitationsStart,
  getTodaysVisitationsEnd
};
