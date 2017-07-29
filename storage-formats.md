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

### visitations-requests
Visitation request objects are stored in a MongoDB as documents with the following fields:
* `timeRequestIssued`: milliseconds since Jan. 1, 1970 (the time the request was issued)
* `visitorUsername`: string (the username of the visitor who issued the request)
* `hostUsername`: string (the username of the host the visitor is requesting to get Vs with)
* `_id`
