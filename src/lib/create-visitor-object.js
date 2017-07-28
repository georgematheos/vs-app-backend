/**
* create-visitor-object
* Given a username and a time, this returns a promise that resolves to an object
* which is a visitor object for server-side storage in a visitations document.
*/

function createVisitorObject(username, time) {
  return Promise.resolve({
    username,
    timeJoinedVs: time,
    timeLeftVs: null
  });
}

module.exports = createVisitorObject;
