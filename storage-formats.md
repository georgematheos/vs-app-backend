# Storage formats
This document contains information on the format in which data is stored on the server for the Vs app.

---

### users
Note that this is the current information, but it may be changed when we upgrade to using the actual Exeter user database.
Users objects are stored in a NEDB as documents with the following fields:
* `username`: string
* `password`: string (stored in an encrypted format)
* `firstName`: string
* `middleName`: string
* `lastName`: string
* `gender`: string
* `isStudent`: boolean
* `isDayStudent`: boolean
* `isDean`: boolean
* `profileImageUrl`: string (this is a link to an image of the user)
* `graduationYear`: integer (the year the user graduates)
* `dormitory`: string
* `roomNumber`: integer
* `_id`

### approved-visitors
Approved Visitors objects are stored in a MongoDB as documents with the following fields:
* `hostUsername`: string
* `approvedVisitors`: an array of usernames (strings) (these are the usernames of the approved visitors for the user specified by `hostUsername`)
* `_id`

### approved-visitor-addition-blocks
Approved Visitor Addition Block objects are stored in a MongoDB as documents with the following fields:
* `blockerUsername`: string
* `blockees`: an array of usernames (strings) (these are the usernames of the people blocked by the  user specified by `blockerUsername` from adding them as an approved visitor)
* `_id`

### visitations
Visitations objects are stored in a MongoDB as documents with the following fields:
* `hostUsername`: string
* `visitors`: an array of objects, each of which has the following properties:
  * `username`: string (the visitor's username)
  * `timeJoinedVs`: milliseconds since Jan. 1, 1970 (the time the visitor joined Vs)
  * `timeLeftVs`: milliseconds since Jan. 1, 1970 (the time the visitor left Vs), or null, if the user has not left
* `startTime`: milliseconds since Jan. 1, 1970 (the time the Vs session began)
* `endTime:` milliseconds since Jan. 1, 1970 (the time the Vs session ended), or null, if Vs session has not yet ended
* `ongoing`: boolean (true if the Vs session has not ended, false if it has)
* `dormitory`: string
* `_id`
* `automaticEndTimedEventId`: id. This field may not be included.  If included, it is the id of a timed event that has been set to end visitations at the end of the day if the user does not end vs.

### visitations-requests
Visitation request objects are stored in a MongoDB as documents with the following fields:
* `timeRequestIssued`: milliseconds since Jan. 1, 1970 (the time the request was issued)
* `visitorUsername`: string (the username of the visitor who issued the request)
* `hostUsername`: string (the username of the host the visitor is requesting to get Vs with)
* `_id`

### visitations-request-blocks
Vs request blocks are stored in the exact same format as approved-visitor-addition-blocks.

### visitations-restrictions
Vs restrictions objects are stored in a MongoDB as documents with the following fields:
* `username`: string (the username of a user who is on Vs restrictions)
* `dormitory`: string (the dorm of the user who is on Vs restrictions [null if day student])
* `_id`

### timed-events
This service is only for use by the server.  It is used to store data about events that have to
be completed at a specific time, such as automatically deleting a visitations request.

Each timed event information object is stored in a MongoDB as a document with the following fields:
* `type`: integer. This is a number that specifies the type of action to perform.  It has a limited number of valid values.
* `time`: milliseconds since Jan. 1, 1970 (the time the event should occur)
* `timerId`: A numerical timer id that can be used in the timer-id-converter (`src/lib/timer-id-converter`) to retrieve a timeoutID (this is the timer which has been set using setTimeout) for the action of performing this timed event. If no timer exists, this property may be unset.  Also note that if the server is turned off, this timerId's value will be meaningless, and should be removed immediatly once the server is turned back on. 
* `_id`

All valid values for `type` are listed below, along with a description of what type of action
they specify:
* `1` - This refers to the action of performing a request to one of the services on the feathers API 
server.  This is currently the only supported value for `type`.  If this is the value chosen, the timed event information object should also contain the following fields:
  * `service`: string (the name of the service using which an operation should be performed)
  * `method`: string (the name of the method that should be performed on this service)
  * `parameters`: array (this is a list of the parameters that should be passed into the request.
    For example, if a GET request is being performed, the array could look like this:
    `[id, params]`. If it is a create request, it could look like this: `[data]`.)
