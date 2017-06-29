## Note:
This is a copy of the api written in a [google drive document](https://docs.google.com/document/d/1AZlMTdyBrJAG-9qV4d5XjEoWY8OIUEbOgibg2oFzDnI/edit?usp=sharing).  The document is, at the moment, the official API and may be more up to date than this document.

–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
Application Functions:
* Authentication
* Getting/Ending V’s
* Add/remove approved visitors
* Faculty adding or removing Vs restrictions
* Display current Vs info for faculty
* Display historical Vs info for faculty

(Note: a draft of BOLD items have been completed or are in progress.)

–––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––-

The server for the Vs application uses the feathers.js (feathersjs.com) framework.  This framework provides tools for the client to make it easier to communicate with the server. While these are not necessary, it is recommended that the client use these tools in order to maintain consistency with the server, and to help make the client code more succinct.

## REST (classic HTTP request/response) API
This webpage explains how to set up a feathers.js REST client: https://docs.feathersjs.com/guides/step-by-step/basic-feathers/rest-client.html. Pay particular attention to the section labeled “Writing the HTML Frontend” – the rest of the page is not important at this point, and may be confusing for one who has not read the prior documentation.
Alternatively, one can include the feathers JS files in a more modular way (which is a better design paradigm in the long run, though it will require a bit of setup).  This process will require using a module loader.  This page contains some details about the process: https://docs.feathersjs.com/api/client.html.

In the feather client examples included in the REST API, it is assumed that the following commands have been run(with the proper javascript files included, as seen in the feathers documentation linked to above). These commands initialize the feathers rest client.
```
const feathersRestClient = feathers()
.configure(feathers.rest(location.origin + ‘/api’).fetch(fetch));
```

### Authentication

POST /api/authenticate
Authenticates a user and returns a valid JWT if successful.

Request Body:
Must include a json that includes the following:
– `username`
– `password`

#### Feathers command
Note that this is more complicated than the majority of the feathers requests, which have the same general form.  This command sets up authentication so a JWT is automatically sent with each feathers HTTP request once a user is logged in, in a header field labeled `x-auth-token`.  For more info about authentication: https://docs.feathersjs.com/api/authentication/client.html.
(Note that if one is using modular loading of feathers, they will need to import the authentication module individually.)

```
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


##### Successful response status code:
`200`


##### Response body:
– `accessToken`: A JWT valid for the user.
– `expiration`: The date and time when the token expires
– `isStudent`: a boolean, which is true if the user is a student and false if the user is a faculty
– `isDean`: a boolean, which is true if the user is a dean and false if the user is not
– `dormitory`: the dorm the user is affiliated with/a member of.  Is empty if the faculty or student is not affiliated with any dorm.
– ‘isDayStudent’: a boolean, true if user is a day student, false if not
– `profileImageURL`: a url linking to an image of the user


### Getting Vs

POST /api/visitations/
This initiates a Vs session.  If the visitor who sends the request is an approved visitor of the host, this will begin Vs.  If the visitor is not an approved visitor, this will send a request to the host asking for approval of the Vs.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the person specified in the request body as by `visitorUsername`.

Request body:
– `visitorUsername`: The username of the visitor initiating Vs.
– `hostUsername`: The username of the host the visitor is initiating Vs with.

#### Feathers command:
```
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
`201` if the visitor is an approved visitor and Vs have begun
`202` if the visitor is not an approved visitor, and a request has been sent to the host so they can approve the Vs


	PUT /api/remove-from-visitations/:username
This ends a user’s involvement in a Vs session (the user is specified by `:username` in the URL).  If the user (again, specified in the URL by `:username`) who sends this request is a visitor, and Vs have started, this removes that visitor from the Vs session.  If the user is a visitor and Vs have not started (but a request has been sent to the host asking for permission to begin Vs), this command cancels the visitor’s request to the host for Vs.  If the user who sends this is a host of a session of visitations, this ends the entire Vs session (removing the host and all visitors from the Vs).

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:username` in the URL.

#### Feathers command:
```
feathersRestClient.service(‘remove-from-visitations’).update(‘username’, {})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code:
`200`





GET /api/visitations-requests/
Returns information about any Vs requests that have been sent to the user specified by `hostUsername` in the URL parameters.

##### Request body (use URL parameters):
– hostUsername: the username of the host who would like to see their requests

#### Feathers command:
```
feathersRestClient.service(‘visitations-requests’).find({ query: {
 hostUsername = ’XXXXX’
}})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Response body:
– `visitations-requests`: An array of visitations requests objects, each of which contains the following fields:
  – `timeRequestIssued`: The date and time (ISO) when the request was issued by the visitor.
  – `visitor`: An object containing information about the user who issued the Vs request.  Includes the following fields:
    – `username`
    – `firstName`
    – `middleName`
    – `lastName`
    – `dormitory`
    – `gender`
    – `graduationYear`: The year the student is scheduled to graduate fromExeter.



PUT /api/visitations-request-response/:hostUsername
This command allows a host (specified in the URL by `:hostUsername`) to respond to a visitor’s request for visitations.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:hostUsername` in the URL.

Request body:
– `visitorUsername`: the username of the visitor whose request the host is responding to
– `acceptRequest`: A boolean; whether or not the host accepts the request.  If true, request is accepted and Vs begin.  If false, request is denied.

#### Feathers command:
```
feathersRestClient.service(‘visitations-request-response`).update(‘hostUsername’, {
	visitorUsername: ‘visitorUsername’,
	acceptResuest: true // or false
}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```


### Approved Visitors

	PUT /api/approved-visitors/:listOwnerUsername
Adds an approved visitor for the user specified by the `:listOwnerUsername` in the url.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified in the url by `:listOwnerUsername`.

##### Request body:
– `approvedVisitorUsername`: The username of the individual who should be added as an approved visitor for the user specified by `:listOwnerUsername`.

#### Feathers command:
```
feathersRestClient.service(‘approved-visitors’).update(‘username’, {
	approvedVisitorUsername: ‘aUsername’
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

	DELETE /api/approved-visitors/:listOwnerUsername
Removes an approved visitor from the approved visitors list of a user specified by `:listOwnerUsername` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for either the user specified by `:listOwnerUsername` in the URL or the user specified by `approvedVisitorUsername` in the request body.

NOTE: THIS COMMAND CAN BE RUN EITHER BY A LIST OWNER REMOVING ONE OF THEIR APPROVED VISITORS, OR BY AN APPROVED VISITOR WHO WISHES TO STOP BEING ANOTHER STUDENT’S APPROVED VISITOR.

##### Request Body:
– `approvedVisitorUsername`: The username of the approved visitor who should be removed from the user’s approved visitors list.
#### Feathers command:
```
feathersRestClient.service(‘approved-visitors’).remove(‘listOwnerUsername’, {
	approvedVisitorUsername: ‘aUsername’,
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```


	PUT /api/block-approved-visitor-addition/:username
Prevents a user from attempting to add the user who issues this command (specified by `:username` in the url) to their approved visitor’s list.  This restriction can be removed by the user who creates it.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:username` in the url.

##### Request body:
– `listOwnerUsername`: The username of the person to ban from adding the user specified by `:username` in the url as an approved visitor.

#### Feathers command:
```
feathersRestClient.service(‘block-approved-visitor-addition’).update(‘usernameOfRequestIssuer’, {
	listOwnerUsername: ‘usernameOfListOwner’
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

	DELETE /api/block-approved-visitor-addition/:username
Removes a ban which the user specified by `:username` in the url had put on another user, preventing the second user from adding the first to their approved visitor’s list.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:username` in the url.

##### Request body:
– `listOwnerUsername`: The username of the person who is banned from adding the user as an approved visitor.  This is the person who the user would like to remove the ban from.

#### Feathers command:
```
feathersRestClient.service(‘block-approved-visitor-addition’).remove(‘usernameOfRequestIssuer’, {
	listOwnerUsername: ‘usernameOfListOwner’
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

### Vs Restrictions

	PUT /api/vs-restrictions/:username
Applies Vs restrictions to the student specified by `:username` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.

#### Feathers command:
```
feathersRestClient.service(‘vs-restrictions’).update(‘usernameOfStudent’, {})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

	DELETE /api/vs-restrictions/:username
Removes Vs restrictions from the student specified by `:username` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.

#### Feathers command:
```
feathersRestClient.service(‘vs-restrictions’).remove(‘usernameOfStudent’, {})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

### Display Vs info for Faculty

	GET /api/vs-data/
Sends information about Vs which are occurring or have occurred in the dorm specified by `:dormitory` in the URL.  This may be filtered to only display current Vs, or by times between which the Vs must have occurred.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a dean or a faculty member affiliated with the dorm specified.

##### Request body (use URL parameters):
– ‘dormitory’: The name of the dorm that the user would like to view Vs in.
– `onlyShowCurrent`: A boolean.  If true, only the Vs which are currently occurring will be returned.
Optional fields:
– `earliestStartTime`: An ISO date.  If this field is included, only Vs which began at or after this time will be retrieved.
– `latestStartTime`: An ISO date.  If this field is included, only Vs which began at or before this time will be retrieved.
– `maxResults`: The maximum number of results to return.  If not included, the server will return 50 results by default, in reverse chronological order by start time.  The cap for this value is 250 (in other words, if `maxResults` is greater than 250, the server will act as though it is 250).
– `firstResultNumber`: The number of the first result which should be returned. If not included, the server will default to returning items starting with result 1.  (For example, if 50 results are returned per request, and you want to retrieve results 51-100, this field should have the value of 51.)

#### Feathers command:
```
feathersRestClient.service(‘current-vs’).find({ query: {
    dormitory: ‘Webster’ // or any other dormitory name
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

##### Response body:
– `resultsFound`: The number of results found which matched the search criteria (which may be more than the number of results returned in this request. For example, if there are 60 results that match criteria, but `maxResults` was set to 20 in the request, only 20 results will be sent by the server, but `resultsFound` will have a value of 60).
– `visitations`: An array of visitations objects, each of which has the following fields:
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

It is worth clarifying what the term “Vs session” refers to.  A Vs session is a continuous, uninterrupted period during which Vs are occurring in an individual’s room.  The same visitor does not have to be getting Vs for the whole time, as long as (an)other visitor(s) joins the Vs before the first visitor leaves.  The Vs session ends once all visitors have left the room, and at that point, a new Vs session begins the next time a visitor begins to get Vs in the room.



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




### Notification: Vs Request

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


#### Event: `vs-in-dorm-changed`
Sent to a dorm faculty when there is a change in a Vs session currently occurring in the dorm.  This includes someone joining or leaving the Vs, or the Vs session ending.

##### Body:
Same body is sent as in the event `vs-began-in-dorm`, but with the current information.

##### Feathers client command:
```
feathersNotificationReciever.on(‘vs-in-dorm-changed’, body => {
    // do something with the information received (called ‘body’)
});
