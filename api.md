#### Note:
A [google drive document](https://docs.google.com/document/d/1AZlMTdyBrJAG-9qV4d5XjEoWY8OIUEbOgibg2oFzDnI/edit?usp=sharing) currently contains the official API.  This document is a new draft of the API that I (George) am working on that I believe will be better in the long run than the previous version.

---

#### Application Functions
* Authentication
* Getting/Ending V’s
* Add/remove approved visitors
* Faculty adding or removing Vs restrictions
* Display current Vs info for faculty
* Display historical Vs info for faculty

---

#### Feathers

The server for the Vs application uses the [feathers.js](feathersjs.com) framework.  This framework provides tools for the client to make it easier to communicate with the server. While these are not necessary, it is recommended that the client use these tools in order to maintain consistency with the server, and to help make the client code more succinct.

---

## REST (classic HTTP request/response) API
This webpage explains how to set up a feathers.js REST client: https://docs.feathersjs.com/guides/step-by-step/basic-feathers/rest-client.html. Pay particular attention to the section labeled “Writing the HTML Frontend” – the rest of the page is not important at this point, and may be confusing for one who has not read the prior documentation.
Alternatively, one can include the feathers JS files in a more modular way (which is a better design paradigm in the long run, though it will require a bit of setup).  This process will require using a module loader.  This page contains some details about the process: https://docs.feathersjs.com/api/client.html.

In the feather client examples included in the REST API, it is assumed that the following commands have been run(with the proper javascript files included, as seen in the feathers documentation linked to above). These commands initialize the feathers rest client.
```javascript
const feathersRestClient = feathers()
.configure(feathers.rest(location.origin + ‘/api’).fetch(fetch));
```

### Authentication

#### Authenticate user
    POST /api/authenticate
Authenticates a user and returns a valid JWT if successful.

Request Body:
Must include a json that includes the following:
– `username`
– `password`

##### Feathers command
Note that this is more complicated than the majority of the feathers requests, which have the same general form.  This command sets up authentication so a JWT is automatically sent with each feathers HTTP request once a user is logged in, in a header field labeled `x-auth-token`.  For more info about authentication: https://docs.feathersjs.com/api/authentication/client.html.
(Note that if one is using modular loading of feathers, they will need to import the authentication module individually.)

```javascript
// Set up authentication abilities
feathersRestClient.configure(feathers.authentication({
    header: ‘x-auth-token’,
    service: ‘authentication’,
    storage: window.localStorage
}));

// Authenticate the user
feathersRestClient.authenticate({
    strategy: ‘local’,
    username: ‘username’,
    password: ‘password’
})
.then(response => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `accessToken`: A JWT valid for the user.
* `expiration`: The date and time when the token expires
* `isStudent`: a boolean, which is true if the user is a student and false if the user is a faculty
* `isDean`: a boolean, which is true if the user is a dean and false if the user is not
* `dormitory`: the dorm the user is affiliated with/a member of.  Is empty if the faculty or student is not affiliated with any dorm.
* `isDayStudent`: a boolean, true if user is a day student, false if not
* `profileImageURL`: a url linking to an image of the user

---

### Visitations

#### Get visitations
    POST /api/visitations/
This initiates a Vs session.  If the visitor who sends the request is an approved visitor of the host, this will begin Vs.  If the visitor is not an approved visitor, this will send a request to the host asking for approval of the Vs.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the person specified in the request body as by `visitorUsername`.

##### Request body (JSON):
– `visitorUsername`: The username of the visitor initiating Vs.
– `hostUsername`: The username of the host the visitor is initiating Vs with.

##### Feathers command:
```javascript
feathersRestClient.service(‘visitations’).create({
    visitorUsername: ‘visitorUsername’,
    hostUsername: ‘hostUsername’
}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code:
* `201` if the visitor is an approved visitor and Vs have begun
* `202` if the visitor is not an approved visitor, and a request has been sent to the host so they can approve the Vs

---

#### View Visitations Data
    GET /api/visitations/
Sends information about Vs.  This may be filtered in many ways, including to only send Vs which are currently occurring.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a dean, faculty member affiliated with a dorm, or a student.

The request will only return information about visitations that the user (determined by who the JWT is valid for) who sends the request has permission to see.  Permissions are as follows:
* Students may only view visitations that they hosted or they were visitors in.  They may view all information about visitations they hosted, but for visitations they were visitors in, they may only view information about themselves and the host, not about other visitors in the Vs session.
* Faculty members may view all information about visitations which occurred in the dorm they are affiliated with.
* Deans may view all information about all visitations.


##### Request parameters (inline URL query):
All fields are optional.
* `onlyShowCurrent`: A boolean.  If included and true, only the Vs which are currently occurring will be returned.
* `dormitory`: A string which is the name of a dormitory. If included, only Vs which occurred in this dormitory will be returned.
* `hostUsername`: A string which is a student's username.  If included, only Vs whom the user specified by this username hosted will be returned.
* `visitorUsername`: A string which is a student's username.  If included, only Vs in which the user specified by this username was a visitor will be returned.
* `earliestStartTime`: An ISO date.  If this field is included, only Vs which began at or after this time will be retrieved.
* `latestStartTime`: An ISO date.  If this field is included, only Vs which began at or before this time will be retrieved.
* `maxResults`: An integer. The maximum number of results to return.  If not included, the server will return 50 results by default, in reverse chronological order by start time.  The cap for this value is 250 (in other words, if `maxResults` is greater than 250, the server will act as though it is 250).
* `firstResultNumber`: The number of the first result which should be returned. If not included, the server will default to returning items starting with result 1.  (For example, if 50 results are returned per request, and you want to retrieve results 51-100, this field should have the value of 51.)

##### Feathers command:
```javascript
feathersRestClient.service(‘current-vs’).find({ query: {
  dormitory: 'Webster' // or any other dormitory name
  onlyShowCurrent: true // or false
  // optionally include more fields
}})
.then(results => {
  // do something with the response if request is successful
})
.catch(err => {
  // do something with error if request is unsuccessful
});
```

##### Response body (JSON):
* `id`: A unique identifier for the visitations session.
* `resultsFound`: The number of results found which matched the search criteria (which may be more than the number of results returned in this request. For example, if there are 60 results that match criteria, but `maxResults` was set to 20 in the request, only 20 results will be sent by the server, but `resultsFound` will have a value of 60).
* `visitations`: An array of visitations objects, each of which has the following fields:
* `host`: A user object for the host.  Contains the following fields:
  * `username`
  * `firstName`
  * `middleName`
  * `lastName`
  * `dormitory`: The host’s dormitory (where the Vs are occurring).
  * `gender`
  * `graduationYear`: The year the student is scheduled to graduate Exeter.
  * `roomNumber`: The host’s room number (where the Vs are occurring)
* `visitors`: An array of user objects for each visitor.  Each object includes all the same fields as a host object except for `roomNumber`.  Each object also includes the following additional fields:
  * `timeJoinedVs`: The time when this visitor joined the Vs session (in the form of an ISO date)
  * `timeLeftVs`: The time when this visitor left the Vs session (in the form of an ISO date).  If they haven’t left, this field will be null.
  * `approvedVisitor`: Whether this student is an approved visitor of the host’s (a boolean value).
* `startTime`: The time when the Vs session started (ie. when the first visitor joined Vs) (in the form of an ISO date)
* `endTime`: The time when the Vs session ended (ie. when the last visitor left Vs) (in the form of an ISO date) (If the Vs haven’t ended, this will be null).
- `ongoing`: A boolean.  True if the Vs are currently occurring, false otherwise.

It is worth clarifying what the term “Vs session” refers to.  A Vs session is a continuous, uninterrupted period during which Vs are occurring in an individual’s room.  The same visitor does not have to be getting Vs for the whole time, as long as (an)other visitor(s) joins the Vs before the first visitor leaves.  The Vs session ends once all visitors have left the room, and at that point, a new Vs session begins the next time a visitor begins to get Vs in the room.


---

#### Remove visitor from visitations
    PATCH /api/visitations/:id

##### Request body (uses [JSON PATCH format](http://jsonpatch.com/))
* `op`: "remove" - This is the operation to be performed.  In this case, the value should be "remove".
* `path`: "/visitors/:username" This is the path of the visitor to be removed.  This should always have the form "/visitors/:username", where `:username` is the username of the visitor to remove from the Vs session.

Removes the specified visitor from a visitations session.  If this is the last/only visitor in the Vs session, the Vs session will end.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for either the visitor who is being removed or for the host of the Vs session the visitor is being removed from.

##### Successful response status code: `200`

##### Feathers command:
```javascript
feathersRestClient.service(‘visitations’).patch(':visitationsId', {
  op: "remove",
  path: "/visitors/:username" // substitute in the visitor's actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

---

### End Vs session
    PATCH /api/visitations/:id

##### Request body (uses [JSON PATCH format](http://jsonpatch.com/))
* `op`: "replace" - This is the operation to be performed.  In this case, the value should be "replace".
* `path`: "/ongoing" - This is the path of the field to be changed; in this case, it is the field "/ongoing", which tracks whether Vs are still currently occurring.
* `value`: false - This is the new value of the field. Since Vs are no longer ongoing (since the user is ending them), set this to false.

Ends the visitations session specified by `:id` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the host of the visitations session.

##### Successful response status code: `200`

##### Feathers command:
```javascript
feathersRestClient.service(‘visitations’).patch(':visitationsID', {
  op: "replace",
  path: "ongoing",
  value: false
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

---
### Visitations requests

#### View visitations requests
    GET /api/visitations-requests/
Returns information about any Vs requests that have been sent to the user specified by `hostUsername` in the request parameters.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `hostUsername` in the request parameters.

##### Request parameters (inline URL query):
* `hostUsername`: the username of the host who would like to see their requests

##### Feathers command:
```javascript
feathersRestClient.service('visitations-requests').find({ query: {
 hostUsername = ’XXXXX’
}})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body:
* `visitations-requests`: An array of visitations requests objects, each of which contains the following fields:
  * `id`: A unique identifier for the visitations request.
  * `timeRequestIssued`: The date and time (ISO) when the request was issued by the visitor.
  * `visitor`: An object containing information about the user who issued the Vs request.  Includes the following fields:
    * `username`
    * `firstName`
    * `middleName`
    * `lastName`
    * `dormitory`
    * `gender`
    * `graduationYear`: The year the student is scheduled to graduate fromExeter.

---

#### Respond to visitations request
    DELETE /api/visitations-request/:id

Responds to and then deletes the visitations request with the id specified by `:id` in the URL.

##### Request parameters (inline URL query):
* `acceptRequest`: A boolean.  If included and `true`,  the visitations request will be accepted and Vs will begin.  If not included or `false`, the visitations request will be denied and Vs will NOT begin.


#### Feathers command:
```javascript
feathersRestClient.service('visitations-requests').remove(':visitationsRequestID', { query: {
	acceptResuest: true // or false
}}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code:
* If visitations request is accepted (and Vs begin): `200` (or `201`, if this is the first visitor in a Vs session, and so a Vs session is created).  Also, a visitations object will be sent with information about the Vs session.
* If the visitations request is denied: `204`

---

### Approved Visitors

#### Add an approved visitor
    PATCH /api/approved-visitors/:listOwnerUsername

##### Request body (uses [JSON PATCH format](http://jsonpatch.com/))
* `op`: "add" - This is the operation to be performed.  In this case, the value should be "add".
* `path`: "/approvedVisitors[-]" - This is the path of the field to be added. In this case, we want to add a value to the end of the array specified by `/approvedVisitors`. The syntax to access the end of this array is `approvedVisitors[-]`
* `value`: ":approvedVisitorUsername" - This is the new value of the field. We want to make it the username of the person the user would like to add as an approved visitor.

Adds an approved visitor for the user specified by `:listOwnerUsername` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified in the url by `:listOwnerUsername`.

#### Feathers command:
```javascript
feathersRestClient.service(‘approved-visitors’).patch(':listOwnerUsername', { // substitute in the actual username
  op: "add",
  path: "/approvedVisitors[-]",
	value: `:approvedVisitorUsername` // substitute in the actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`.

---

#### Remove an approved visitor
  	PATCH /api/approved-visitors/:listOwnerUsername

##### Request body (uses [JSON PATCH format](http://jsonpatch.com/))
* `op`: "remove" - This is the operation to be performed.  In this case, the value should be "remove".
* `approvedVisitorUsername`: ":aUsername" - This is the username of the user who we would like to remove from the list.  The server will handle the logic of removing this user.

Removes an approved visitor from the approved visitors list of a user specified by `:listOwnerUsername` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for either the user specified by `:listOwnerUsername` in the URL or the user specified by `approvedVisitorUsername` in the request body.

NOTE: THIS COMMAND CAN BE RUN EITHER BY A LIST OWNER REMOVING ONE OF THEIR APPROVED VISITORS, OR BY AN APPROVED VISITOR WHO WISHES TO STOP BEING ANOTHER STUDENT’S APPROVED VISITOR.

##### Request Body:
– `approvedVisitorUsername`: The username of the approved visitor who should be removed from the user’s approved visitors list.
#### Feathers command:
```javascript
feathersRestClient.service(‘approved-visitors’).patch(':listOwnerUsername', { // substitute in the actual username
  op: "remove",
	approvedVisitorUsername: `:approvedVisitorUsername` // substitute in the actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});

```

---
#### Block approved visitor addition
	POST /api/approved-visitor-addition-block/

Prevents a user from attempting to add the user who issues this command to their approved visitors list.  This restriction can be removed by the user who creates it.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `approvedVisitorUsername` in the request body.

##### Request body:
* `approvedVisitorUsername`: The user who is issuing this request and would not like to be added as an approved visitor.
* `listOwnerUsername`: The username of the person to ban from adding the user specified by `approvedVisitorUsername`as an approved visitor.

#### Feathers command:
```javascript
feathersRestClient.service('approved-visitor-addition-block').create({
  approvedVisitorUsername: ':aUsername'
	listOwnerUsername: ':anotherUsername'
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `201`

---

#### Remove a block on approved visitor addition
	 DELETE /api/approved-visitor-addition-block/:approvedVisitorUsername/:listOwnerUsername
Removes a ban which the user specified by `:approvedVisitorUsername` in the URL had put on another user, specified by `:listOwnerUsername`.  This ban had prevented the list owner from adding the other user as an approved visitor, and this command will remove that ban.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:approvedVisitorUsername` in the url.

#### Feathers command:
```javascript
feathersRestClient.service('approved-visitor-addition-block').remove(':approvedVisitorUsername/:listOwnerUsername', {}) // substitute in correct values for these usernames
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `204`

---

### Vs Restrictions

#### Put a user on Vs restrictions
	 PUT /api/vs-restrictions/:username
Applies Vs restrictions to the student specified by `:username` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.

##### Response body (JSON):
Optional.
* `endTime`: An ISO date. The date and time when the Vs restrictions should end, and the user should be allowed to get Vs again.  If this value is not included, restrictions will remain until a faculty member or dean removes the restriction.

##### Feathers command:
```javascript
feathersRestClient.service('vs-restrictions').update(':usernameOfStudent', {
  endTime: // an ISO date
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `201`

---
#### Remove a visitor from Vs restrictions

	 DELETE /api/vs-restrictions/:username
Removes Vs restrictions from the student specified by `:username` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.

#### Feathers command:
```javascript
feathersRestClient.service('vs-restrictions').remove(':usernameOfStudent', {})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `204`

---

## Websockets API
Websockets is another technique for having the server and client communicate.  While REST only allows the client to initiate communication, making requests for the server to respond to, Websockets allows either the client or server to initiate communication.  Thus, it is useful for notifications, so the server can send information to the client when a notification occurs, without the client first making a request.

As with REST, feathers provides a client-side framework for Websockets.  Its configuration is quite simple and described in the “Changing the HTML for Feathers client WebSocket calls“ section of the following webpage: https://docs.feathersjs.com/guides/step-by-step/basic-feathers/socket-client.html.  As noted at the beginning of the REST API, there is a more modular way of including feathers files that is a better design paradigm.
The feathers command examples below assume that the following commands have already been run, with the files above included:

```
const socket = io(location.origin + ‘/api’);
const feathersSocketClient = feathers().configure(feathers.socketio(socket));

// All notifications are sent with the service called ‘notifications’
const feathersNotificationReciever = feathersSocketClient.service(‘notifications’);
```

Note that this `feathersSocketClient` can be used instead of the `feathersRestClient` in the examples in the REST API section without any syntax errors.  In fact, the server will most likely be designed so that this replacement will work just fine.  However, that is not a guarantee, and so I would recommend using the REST client for the REST commands.

The use of the websockets client is for receiving information from the server, so the API that will be described is the format of information the server will send the client, and how to set up the client to receive this information.  Use the REST API to send information to the server.

---

#### Event: `vs-request`

Sent to a host when a visitor has issued a request to get Vs with the host.  Note that the body is the same as the visitations request object described in the REST API under the `GET /api/visitations-requests/:hostUsername` request description.

##### Body:
– `timeRequestIssued`: The date and time (ISO) when the request was issued by the visitor.
– `visitor`: An object containing information about the user who issued the Vs request.  Includes the following fields:
  – `username`
  – `firstName`
  – `middleName`
  – `lastName`
  – `dormitory`
  – `gender`
  – `graduationYear`: The year the student is scheduled to graduate fromExeter.

##### Feathers client command:
```
feathersNotificationReciever.on(‘vs-request’, body => {
    // do something with the information received (called ‘body’)
});
```

---

#### Event: `vs-began-in-dorm`

Sent to a dorm faculty member when a student in the dorm begins getting Vs.

##### Body:
A visitations object.  Note that this is identical to the visitations object described in the REST API section describing the command `GET /api/vs-data/:dormitory/`.

Contains the following fields:
– `host`: A user object for the host.  Contains the following fields:
    – `username`
    – `firstName`
    – `middleName`
    – `lastName`
    – `dormitory`: The host’s dormitory (where the Vs are occurring).
    – `gender`
    – `graduationYear`: The year the student is scheduled to graduate Exeter.
    – `roomNumber`: The host’s room number (where the Vs are occurring)
  – `visitors`: An array of user objects for each visitor.  Each object includes all the same fields as a host object except for `roomNumber`.  Each object also includes the following additional fields:
    – `timeJoinedVs`: The time when this visitor joined the Vs session (in the form of an ISO date)
    – `timeLeftVs`: The time when this visitor left the Vs session (in the form of an ISO date).  If they haven’t left, this field will be null.
    – `approvedVisitor`: Whether this student is an approved visitor of the host’s (a boolean value).
  – `startTime`: The time when the Vs session started (ie. when the first visitor joined Vs) (in the form of an ISO date)
  – `endTime`: The time when the Vs session ended (ie. when the last visitor left Vs) (in the form of an ISO date) (If the Vs haven’t ended, this will be null).

##### Feathers client command:
```
feathersNotificationReciever.on(‘vs-began-in-dorm’, body => {
    // do something with the information received (called ‘body’)
});
```

---

#### Event: `vs-in-dorm-changed`
Sent to a dorm faculty when there is a change in a Vs session currently occurring in the dorm.  This includes someone joining or leaving the Vs, or the Vs session ending.

##### Body:
Same body is sent as in the event `vs-began-in-dorm`, but with the current information.

##### Feathers client command:
```
feathersNotificationReciever.on(‘vs-in-dorm-changed’, body => {
    // do something with the information received (called ‘body’)
});
