# Visitations App Server API
This document contains the official API for the visitations app server.

It is fairly final at this point, but still subject to change if the developers feel it is important.

## Table of Contents

* [Application Functions](#appFunctions)
* [Feathers](#feathers)
* [REST API](#restApi)
  * [Authentication](#authentication)
    * [Authenticate user](#authenticateUser)
  * [Visitations](#visitations)
    * [Get/join visitations](#getJoinVisitations)
    * [View visitations data](#viewVisitationsData)
    * [Remove visitor from visitations](#removeVisitorFromVisitations)
    * [End Vs session](#endVsSession)
  * [Visitations requests](#visitationsRequests)
    * [View visitations requests](#viewVisitationsRequests)
    * [Respond to or delete visitations request](#respondToOrDeleteVisitationsRequest)
    * [Block Vs requests from a user](#blockVsRequestsFromAUser)
    * [Remove Vs request block](#removeVsRequestBlock)
    * [View Vs request blocks you created](#viewvisitationsRequestBlocksYouCreated)
  * [Approved Visitors](#approvedVisitors)
    * [Add an approved visitor](#addAnApprovedVisitor)
    * [Remove an approved visitor](#removeAnApprovedVisitor)
    * [View Approved Visitors](#viewApprovedVisitors)
    * [View users for whom one is an approved visitor](#viewUsersForWhomOneIsAnApprovedVisitor)
    * [Block approved visitor addition](#blockApprovedVisitorAddition)
    * [Remove a block on approved visitor addition](#removeABlockOnApprovedVisitorAddition)
    * [View approved visitor addition blocks you created](#viewApprovedVisitorAdditionBlocksYouCreated)
  * [Vs Restrictions](#visitationsRestrictions)
    * [Put a user on Vs restrictions](#putAUserOnvisitationsRestrictions)
    * [View Users on Vs Restrictions](#viewUsersOnVsRescrictions)
    * [Remove a user from Vs restrictions](#removeAUserFromvisitationsRestrictions)
* [Websockets API](#websocketsApi)
  * [Notification for Vs request](#notificationForVsRequest)
  * [Notification for Vs beginning in dorm](#notificationForVsBeginningInDorm)
  * [Notification for Vs in dorm changing](#notificationForVsInDormChanging)
* [Object Type Definitions](#objectTypeDefinitions)
  * [User Object](#userObject)
  * [Visitations Object](#visitationsObject)
  * [Visitations Request Object](#visitationsRequestObject)
* [Term Definitions](#termDefinitions)
  * [Standard pagination interface](#standardPaginationInterfaceTerm)
  * [Visitations Session](#visitationsSessionTerm)

---
#### <a name="appFunctions"></a>Application Functions
* Authentication
* Getting/Ending V's
* Add/remove approved visitors
* Faculty adding or removing Vs restrictions
* Display current Vs info for faculty
* Display historical Vs info for faculty

---

#### <a name="feathers"></a>Feathers

The server for the Vs application uses the [feathers.js](feathersjs.com) framework.  This framework provides tools for the client to make it easier to communicate with the server. While these are not necessary, it is recommended that the client use these tools in order to maintain consistency with the server, and to help make the client code more succinct.

---

## <a name="restApi"></a>REST (classic HTTP request/response) API
This webpage explains how to set up a feathers.js REST client: https://docs.feathersjs.com/guides/step-by-step/basic-feathers/rest-client.html. Pay particular attention to the section labeled “Writing the HTML Frontend” – the rest of the page is not important at this point, and may be confusing for one who has not read the prior documentation.  Note that when including the feathers source in an HTML file that this page may display an inaccurate version of the url which applies to an outdated version of feathers. https://docs.feathersjs.com/api/client.html should contain an example with a more accurate url.
Alternatively, one can include the feathers JS files in a more modular way (which is a better design paradigm in the long run, though it will require a bit of setup).  This process will require using a module loader.  This page contains some details about the process: https://docs.feathersjs.com/api/client.html.

In the feather client examples included in the REST API, it is assumed that the following commands have been run(with the proper javascript files included, as seen in the feathers documentation linked to above). These commands initialize the feathers rest client.
```javascript
const feathersRestClient = feathers()
.configure(feathers.rest(location.origin + '/api').fetch(fetch));
```

---

### <a name="authentication"></a>Authentication

#### <a name="authenticateUser"></a>Authenticate user
    POST /api/authenticate
Authenticates a user and returns a valid JWT if successful.

Request Body (JSON):
Must include a json that includes the following:
* `username`
* `password`

##### Feathers command
Note that this is more complicated than the majority of the feathers requests, which have the same general form.  This command sets up authentication so a JWT is automatically sent with each feathers HTTP request once a user is logged in, in a header field labeled `x-auth-token`.  For more info about authentication: https://docs.feathersjs.com/api/authentication/client.html.
(Note that if one is using modular loading of feathers, they will need to import the authentication module individually.)

```javascript
// Set up authentication abilities
feathersRestClient.configure(feathers.authentication({
    header: 'x-auth-token',
    service: 'authentication',
    storage: window.localStorage
}));

// Authenticate the user
feathersRestClient.authenticate({
    strategy: 'local',
    username: ':username', // fill in real username and password
    password: ':password'
})
.then(response => {
    // feathers automatically configures hooks so the jwt is sent with further feathers requests
    // make sure the feathersRestClient.authenticate command has been run before making requests that require authentication
    // note that due to the asynchronous nature of this function, this will probably be more complicated than simply running commands at a lower down point in the code than the authentication
    // one easy way to deal with this is to just run any authenticated requests within this then
    // also note that if a session continues after this token has expired, requests will be sent with the outdated token, so this function will have to be called again to get a new one

    // of course, you may do something with the response in this .then if it is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `201`

##### Response body (JSON):
* `accessToken`: A JWT valid for the user. The payload sent with it will include a field `exp` containing the time the token expires (as [Unix time](https://en.wikipedia.org/wiki/Unix_time)).
* `user`: A [user object](#userObject) with information about the user.

---

### <a name="visitations"></a>Visitations

#### <a name="getJoinVisitations"></a>Get/join visitations
    POST /api/visitations/
A user who would like to visit another's room during visitations should send this request.  If the visitor is an approved visitor for the specified host, this command will create a [visitations session](#visitationSessionTerm) with the visitor being the only visitor, or, if visitations are already in progress in the host's room, will add the visitor to that [visitations session](#visitationSessionTerm).  If the visitor is not an approved visitor, this will send a request to the host asking for permission for that user to join Vs (the visitor may not send a request if they have already sent a request to another host, and this request has not yet been deleted; also note that if the visitor sends a request to the host while another request exists which they have sent to the same host, the first request will be deleted and replaced with the second).  If the host grants permission, a [visitations session](#visitationSessionTerm) will be started if none is currently in progress, or the visitor will be added to the one currently in progress, if one exists.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the person specified in the request body as by `visitorUsername`.

Note: if a visitations session has not been ended by 15 minutes after the latest time on a day when visitations are allowed, the session will automatically end.  If this happens, a field called `automaticallyEnded` on the [visitations object](#visitationsObject) will have the value `true`.

##### Request body (JSON):
* `visitorUsername`: The username of the visitor initiating Vs.  Must be a student's username.
* `hostUsername`: The username of the host the visitor is initiating Vs with.  Must be a boarding student's username.

##### Feathers command:
```javascript
feathersRestClient.service('visitations').create({
    visitorUsername: ':visitorUsername', // fill in real usernames
    hostUsername: ':hostUsername'
}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `201`

A successful response body will contain a field called `$actionPerformed`.  This field will have one of the following values:
* `visitations session created` - a new visitations session has been created
* `visitations session joined` - the visitor has been added to an ongoing visitations session
* `visitations request created` - a visitations request has been sent to the specified host

---

#### <a name="viewVisitationsData"></a>View Visitations Data
    GET /api/visitations/
Sends information about Vs.  This may be filtered in many ways, including to only send Vs which are currently occurring.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a dean, faculty member affiliated with a dorm, or a student.

The request will only return information about visitations that the user (determined by who the JWT is valid for) who sends the request has permission to see.  Permissions are as follows:
* Students may only view visitations that they hosted or they were visitors in.  They may view all information about visitations they hosted, but for visitations they were visitors in, they may only view information about themselves and the host, not about other visitors in the Vs session.
* Faculty members may view all information about visitations which occurred in the dorm they are affiliated with.
* Deans may view all information about all visitations.

This request uses the [standard pagination interface](#standardPaginationInterfaceTerm).

##### Request parameters (inline URL query):
All fields are optional.
* `onlyShowCurrent`: A boolean.  If included and true, only the Vs which are currently occurring will be returned.
* `dormitory`: A string which is the name of a dormitory. If included, only Vs which occurred in this dormitory will be returned.
* `hostUsername`: A string which is a student's username.  If included, only Vs whom the user specified by this username hosted will be returned.
* `visitorUsername`: A string which is a student's username.  If included, only Vs in which the user specified by this username was a visitor will be returned.
* `earliestStartTime`: A date and time, expressed as milliseconds since Jan. 1, 1970.  If this field is included, only Vs which began at or after this time will be retrieved.
* `latestStartTime`: A date and time, expressed as milliseconds since Jan. 1, 1970.  If this field is included, only Vs which began at or before this time will be retrieved.

##### Feathers command:
```javascript
feathersRestClient.service('current-vs').find({ query: {
  dormitory: 'Webster' // or any other dormitory name
  onlyShowCurrent: true // or false
  // optionally include more fields or exclude fields shown
}})
.then(results => {
  // do something with the response if request is successful
})
.catch(err => {
  // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `visitations`: An array of [visitations objects](#visitationsObject), representing the [visitations sessions](#visitationsSessionTerm) which match the search criteria.

---

#### <a name="removeVisitorFromVisitations"></a>Remove visitor from visitations
    PATCH /api/visitations/:id

##### Request body
* `op`: "removeVisitor" - The operation to perform is to remove a visitor.
* `visitorUsername`: This is the username of the visitor to remove from the [visitations session](#visitationsSessionTerm).  This user must currently be part of the visitations session.

Removes the specified visitor from a [visitations session](#visitationSessionType).  If this is the last/only visitor in the Vs session, the Vs session will end.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for either the visitor who is being removed or for the host of the Vs session the visitor is being removed from.

##### Feathers command:
```javascript
feathersRestClient.service('visitations').patch(':visitationsId', { // fill in real ID
  op: "removeVisitor",
  visitorUsername: ":visitorUsername" // substitute in the visitor's actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

### <a name="endVsSession"></a>End Vs session
    PATCH /api/visitations/:id

##### Request body
* `op`: "endVisitations" - The operation to perform is to end the [visitations session](#visitationSessionType).

Ends the [visitations session](#visitationSessionType) specified by `:id` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the host of the [visitations session](#visitationSessionType).

##### Successful response status code: `200`

##### Feathers command:
```javascript
feathersRestClient.service('visitations').patch(':visitationsID', { // fill in real ID
  op: "endVisitations"
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

---

### <a name="visitationsRequests"></a>Visitations requests

Note that any visitations request which has not been responded to will be automatically deleted after 10 minutes have passed since the request's creation.  A user may always issue another Vs request if one expires before it is responded to.

#### <a name="viewVisitationsRequests"></a>View visitations requests
    GET /api/visitations-requests/
Returns information about any Vs requests that have been sent to the user specified by `hostUsername` in the request parameters, or that have been sent by the user specified by `visitorUsername` in the request parameters.

This must include a valid JWT in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `hostUsername` or `visitorUsername` in the request parameters.

This request uses the [standard pagination interface](#standardPaginationInterfaceTerm).

##### Request parameters (inline URL query):
EXACTLY ONE OF THE FOLLOWING FIELDS SHOULD BE INCLUDED (NOT BOTH):
* `hostUsername`: The username of the host who would like to see Vs requests which have been sent to them.  Must be a boarding student.
* `visitorUsername`: The username of a user who would like to see Vs requests which they have sent to others.  Must be a student.

##### Feathers command:
```javascript
feathersRestClient.service('visitations-requests').find({ query: {
 hostUsername = ':hostUsername' // fill in real username
}})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `visitationsRequests`: An array of [visitations requests objects](#visitationsRequestObjects) that match the query (from the request parameters).

---

#### <a name="respondToOrDeleteVisitationsRequest"></a>Respond to or delete visitations request
    DELETE /api/visitations-request/:id

If this is sent by the person who issued this visitations request, this command deletes the visitations request with the id specified by `:id` in the URL.  If it is sent by the user who received this visitations request, this responds to the request, and then deletes it.

This must include a valid JWT (javascript web token) in the header labeled x-auth-token. This JWT must be valid for the user who issued the visitations request (in which case this will delete the Vs request without further consequences), or for the user who received the Vs request, in which case the Vs request will either be accepted or denied.

##### Request parameters (inline URL query):
* `acceptRequest`: A boolean.  If included and `true`,  the visitations request will be accepted and Vs will begin.  If not included or `false`, the visitations request will be denied and Vs will NOT begin.  This parameter should only be included if the user issuing the command is the person who RECEIVED the Vs request, and will be ignored otherwise.


##### Feathers command:
```javascript
feathersRestClient.service('visitations-requests').remove(':visitationsRequestID', { query: { // fill in real ID
	acceptResuest: true // or false
}}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

A successful response body will contain a field called `$actionPerformed`.  This field will have one of the following values:
* `visitations session created` - the request was accepted and a visitations session was created with the host and the visitor in it
* `visitations session joined` - the request was accepted and the visitor who had issued the request has joined the current vs session the host is in
* `visitations request deleted` - the request was deleted and no visitations sessions have been created or changed


---

#### <a name="blockVsRequestsFromAUser"></a>Block Vs requests from a user
    PATCH /api/visitations-request-blocks/:blockerUsername
    
##### Request Body (JSON):
* `op`: "addBlock",
* `blockeeUsername`: The username of the person to block from sending a visitations request to the user with the username `:blockerUsername`.

Prevents a user (with the username `blockeeUsername`) from sending Vs requests to the user  with the username `:blockerUsername`.  This restriction can be removed by the user who creates it.

This must include a valid JWT (javascript web token) in the header labeled x-auth-token. This JWT must be valid for the user specified by `hostUsername` in the request body.  Also note that both the blockee must be a student, and the blocker must be a boarding student.

##### Feathers command:
```javascript
feathersRestClient.service('vs-request-block').patch(':blockerUsername', {
  op: 'addBlock',
	blockeeUsername: ':blockeeUsername' // fill in real values
}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

#### <a name="removeVsRequestBlock"></a>Remove Vs request block
    PATCH /api/visitations-request-blocks/:blockerUsername
    
##### Request Body (JSON):
* `op`: "removeBlock",
* `blockeeUsername`: the username of the person to block from sending a visitations request to the user with the username `:blockerUsername`

Removes a block placed by the user with username `:blockerUsername` on the user with username `blockeeUsername` that prevented the blockee from sending the blocker vs requests.

This must include a valid JWT (javascript web token) in the header labeled x-auth-token. This JWT must be valid for the user specified by `:blockerUsername` in the URL.  Also note that both the blockee must be a student, and the blocker must be a boarding student.

##### Feathers command:
```javascript
feathersRestClient.service('vs-request-block').patch(':blockerUsername', {
  op: 'removeBlock',
	blockeeUsername: ':blockeeUsername' // fill in real values
}).then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

#### <a name="viewvisitationsRequestBlocksYouCreated"></a>View Vs request blocks you created
    GET /api/visitations-request-blocks/:blockerUsername

Returns info on all the users the user specified by `:blockerUsername` in the URL has blocked from making Vs requests to them.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:blockerUsername` in the url, or for a dean.  Note that the user specified by `:blockerUsername` must be a student.

#### Feathers command:
```javascript
feathersRestClient.service('visitations-request-blocks').get(':blockerUsername', {}) // fill in real username
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `blocker`: A [user object](#userObject) for the user who has blocked these users.
* `blockees`: An array of [user objects](#userObject), one for each user who is blocked.

---

### <a name="approvedVisitors"></a>Approved Visitors

#### <a name="addAnApprovedVisitor"></a>Add an approved visitor
    PATCH /api/approved-visitors/:listOwnerUsername

##### Request body (JSON):
* `op`: "addApprovedVisitor" - The operation to perform is to add an approved visitor.
* `approvedVisitorUsername`: The username of the user to be made an approved visitor.

Adds an approved visitor for the user specified by `:listOwnerUsername` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified in the url by `:listOwnerUsername`. Also note that the approved visitor must be a student, and the list owner must be a boarding student.

#### Feathers command:
```javascript
feathersRestClient.service('approved-visitors').patch(':listOwnerUsername', { // substitute in the actual username
  op: "addApprovedVisitor",
  approvedVisitorUsername: ":username" // fill in the actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

#### <a name="removeAnApprovedVisitor"></a>Remove an approved visitor
  	PATCH /api/approved-visitors/:listOwnerUsername

##### Request body (JSON):
* `op`: "removeApprovedVisitor" - The operation to perform is to remove an approved visitor.
* `approvedVisitorUsername` - This is the username of the user who we would like to remove from the list.  The server will handle the logic of removing this user.

Removes an approved visitor from the approved visitors list of a user specified by `:listOwnerUsername` in the URL.  Also note that the approved visitor must be a student, and the list owner must be a boarding student.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for either the user specified by `:listOwnerUsername` in the URL or the user specified by `approvedVisitorUsername` in the request body.

NOTE: THIS COMMAND CAN BE RUN EITHER BY A LIST OWNER REMOVING ONE OF THEIR APPROVED VISITORS, OR BY AN APPROVED VISITOR WHO WISHES TO STOP BEING ANOTHER STUDENT'S APPROVED VISITOR.

##### Feathers command:
```javascript
feathersRestClient.service('approved-visitors').patch(':listOwnerUsername', { // substitute in the actual username
  op: "removeApprovedVisitor",
	approvedVisitorUsername: `:username` // substitute in the actual username
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});

```

##### Successful response status code: `200`

---

#### <a name="viewApprovedVisitors"></a>View approved visitors
    GET /api/approved-visitors/:listOwnerUsername

Returns a list of the approved visitors of a user specified by `:listOwnerUsername` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for any of the following people:
* The user specified by `:listOwnerUsername`.
* A dean.
* A faculty member affiliated with the same dormitory as the user specified by `:listOwnerUsername`.
Also note that the user specified by `:listOwnerUsername` must be a boarding student.

##### Feathers command:
```javascript
feathersRestClient.service('approved-visitors').get(':listOwnerUsername', {}) // substitute in the actual username
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});

```

##### Successful response status code: `200`

##### Response body (JSON):
* `listOwner`: A [user object](#userObject) for the user who has added the other users as approved visitors.
* `approvedVisitors`: An array of [user objects](#userObject) representing the approved visitors.  These objects do not contain the field `roomNumber`.

---

#### <a name="viewUsersForWhomOneIsAnApprovedVisitor"></a>View users for whom one is an approved visitor
    GET /api/host-approvers/:approvedVisitorUsername
Returns information about all users for whom the user sending this request is an approved visitor.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:approvedVisitorUsername` in the URL, or for a dean.  Note that the user specified by `:approvedVisitorUsername` must be a student.

##### Feathers command:
```javascript
feathersRestClient.service('host-approvers').get(':approvedVisitorUsername', {}) // substitute in the actual username
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});

```

##### Successful response status code: `200`

##### Response body (JSON):
* `approvedVisitor`: A [user object](#userObject) for the user who is an approved visitor for the users in the `hostApprovers` array (the user issuing this request)
* `hostApprovers`: An array of [user objects](#userObject) representing the hosts for whom the request issuer is an approved visitor.

---

#### <a name="blockApprovedVisitorAddition"></a>Block approved visitor addition
	 PATCH /api/approved-visitor-addition-blocks/:blockerUsername

##### Request Body (JSON):
* `op`: "addBlock" - The operation to perform is to add a block. In other words, to make it so a user is blocked from adding them as an approved visitor.
* `blockeeUsername`: The username of the person to block (to prevent from attempting to add the person specified by `:blockerUsername` in the URL as an approved visitor).

Prevents a user from attempting to add the user who issues this command to their approved visitors list.  This restriction can be removed by the user who creates it.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:blockerUsername` in the URL.  Also note that the blocker must be a student, and the blockee must be a boarding student.

##### Feathers command:
```javascript
feathersRestClient.service('approved-visitor-addition-blocks').PATCH(':blockerUsername', {
  op: 'addBlock',
	blockeeUsername: ':blockeeUsername' // fill in real usernames
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

#### <a name="removeABlockOnApprovedVisitorAddition"></a>Remove a block on approved visitor addition
	 PATCH /api/approved-visitor-addition-blocks/:blockerUsername

#### Request Body (JSON):
* `op`: "removeBlock" - the operation to perform is to remove a block on approved visitor addition the request issuer had previously created
* `blockeeUsername`: the username of the user to unblock

Removes a ban which the user specified by `:blockerUsername` in the URL had put on another user, specified by `blockeeUsername` in the request body.  This ban had prevented the list owner from adding the other user as an approved visitor, and this command will remove that ban.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:blockerUsername` in the url.  Note that the blocker must be a student, and the blockee must be a boarding student.

##### Feathers command:
```javascript
feathersRestClient.service('approved-visitor-addition-blocks').patch(':blockerUsername', {
  op: 'removeBlock',
  blockeeUsername: ':blockeeUsername' // fill in real values for usernames
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---
#### <a name="viewApprovedVisitorAdditionBlocksYouCreated"></a>View approved visitor addition blocks you created
    GET /api/approved-visitor-addition-blocks/:blockerUsername

Returns info on all the users the user specified by `:blockerUsername` in the URL has blocked from adding themself as an approved visitor.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for the user specified by `:blockerUsername` in the url, or for a dean.  Note that the user specified by `:blockerUsername` must be a student.

#### Feathers command:
```javascript
feathersRestClient.service('approved-visitor-addition-blocks').get(':blockerUsername', {}) // fill in real username
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `blocker`: A [user object](#userObject) for the user who has blocked these users.
* `blockees`: An array of [user objects](#userObject), one for each user who is blocked.

---

### <a name="visitationsRestrictions"></a>Vs Restrictions

#### <a name="putAUserOnvisitationsRestrictions"></a>Put a user on Vs restrictions
	 PUT /api/visitations-restrictions/:username
Applies Vs restrictions to the student specified by `:username` in the URL.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.  Also note that the user specified by `:username` must be a student.

##### Request body (JSON):
Optional.
* `endTime`: A date and time, expressed as milliseconds since Jan. 1, 1970. The date and time when the Vs restrictions should end, and the user should be allowed to get Vs again.  If this value is not included, restrictions will remain until a faculty member or dean removes the restriction.

##### Feathers command:
```javascript
feathersRestClient.service('visitations-restrictions').update(':usernameOfStudent', { // fill in real username
  endTime: // A date and time, expressed as milliseconds since Jan. 1, 1970.
})
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

#### <a name="viewUsersOnVsRescrictions"></a>View users on Vs restrictions
    
    GET /api/visitations-restrictions
Returns info on users who are on Vs restrictions.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a student (in which case only vs restrictions for that student will be returned), a faculty member affiliated with a dorm (in which case only vs restrictions for students in that dorm will be returned), or a dean (in which case all vs restrictions may be returned).

This request uses the [standard pagination interface](#standardPaginationInterfaceTerm).

##### Request parameters (inline URL query) (optional):
* `username`: If included, this will only return restrictions for the user with the username specified here. Will be ignored if a student is making the request.
* `dormitory`: If included, this will only return restrictions on people in the specified dorm. Will be ignored if a non-dean faculty member is making the request.

#### Feathers command:
```javascript
feathersRestClient.service('visitations-restrictions').find({}) // optionally put a query
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

##### Response body (JSON):
* `restrictedUsers`: an array of [user objects](#userObject), one for each user on Vs restrictions who matched the query

---

#### <a name="removeAUserFromvisitationsRestrictions"></a>Remove a user from Vs restrictions

	 DELETE /api/visitations-restrictions/:username
Removes Vs restrictions from the student specified by `:username` in the URL.  This user must currently be on Vs restrictions for this to have any effect.

This must include a valid JWT (javascript web token) in the header labeled `x-auth-token`.  This JWT must be valid for a faculty member affiliated with the dorm of the student to be put on Vs restrictions, or a dean.

#### Feathers command:
```javascript
feathersRestClient.service('visitations-restrictions').remove(':usernameOfStudent', {}) // fill in real username
.then(results => {
    // do something with the response if request is successful
})
.catch(err => {
    // do something with error if request is unsuccessful
});
```

##### Successful response status code: `200`

---

## <a name="websocketsApi"></a>Websockets API

NOTE that this section is less final than the REST section, and is relatively likely to change.

Websockets is another technique for having the server and client communicate.  While REST only allows the client to initiate communication, making requests for the server to respond to, Websockets allows either the client or server to initiate communication.  Thus, it is useful for notifications, so the server can send information to the client when a notification occurs, without the client first making a request.

As with REST, feathers provides a client-side framework for Websockets.  Its configuration is described in the “Changing the HTML for Feathers client WebSocket calls“ section of the following webpage: https://docs.feathersjs.com/guides/step-by-step/basic-feathers/socket-client.html.  As noted at the beginning of the REST API, there is a more modular way of including feathers files that is a better design paradigm.
Make sure to include the socket.io client properly; I found that the [socket.io website](https://socket.io) has better documentation for this than the feathers webpage.
The feathers command examples below assume that the following commands have already been run, with the files above included:

```javascript
const socket = io(location.origin);
const feathersSocketClient = feathers()
.configure(feathers.socketio(socket))
.configure(feathers.hooks())
.configure(feathers.authentication({
  header: 'x-auth-token',
  service: '/api/authentication',
  storage: window.localStorage
}));
```

Note that this `feathersSocketClient` can be used instead of the `feathersRestClient` in the examples in the REST API section.  The only thing to note is that with socket.io, we cannot initialize the connection to be directly to the `api/` route, so each time a service is called, we must put the `api/` before it.  For example, the visitations service would be accessed using `app.service('/api/visitations')`, not `app.service('/visitations')`.

After this configuration is run, this client should make sure to authenticated:

```javascript
feathersSocketClient.authenticate({
  strategy: 'local',
  username: ':username', // fill in real username and password
  password: ':password'
})
.then(result => {
  // run all further feathers commands from here, so the user is authenticated
});
```

The use of the websockets client is for receiving information from the server, so the API that will be described is the format of information the server will send the client, and how to set up the client to receive this information.  Use the REST API to send information to the server (even if it is done over a websockets connection, the api for it is described above).

---

#### <a name="notificationForVsRequest"></a>Notification for Vs request
When a user is sent the visitations request, the event `created` will be sent to them on the `visitations-request` service.

##### Feathers client command to handle event:
```javascript
feathersSocketClient.service('/api/visitations-requests').on('created', data => {
  // do something
});
```

The data sent will be a [visitations request object](#visitationsRequestObject).

---

#### <a name="notificationForVsBeginningInDorm"></a> Notification for Vs beginning in dorm
When a visitations session begins in the dorm, all faculty members affiliated with that dorm, and 
all deans, will be sent a `created` event on the `visitations` service.

##### Feathers client command to handle event:
```javascript
feathersSocketClient.service('/api/visitations').on('created', data => {
    // do something
});
```

The data sent will be a [visitations object](#visitationsObject) for the vs session which
has started.

---

#### <a name="notificationForVsInDormChanging"></a>Notification for Vs in dorm changing
##### Event: `vs-in-dorm-changed`
When a visitations session in a dorm changes in some way, all faculty members affiliated with that 
dorm, and all deans, will be sent a `patched` event on the `visitations` service.

##### Feathers client command to handle event:
```javascript
feathersSocketClient.service('/api/visitations').on('patched', data => {
    // do something
});
```

The data sent will be an up-to-date [visitations object](#visitationsObject) for the vs session 
which has modified.

## <a name="objectTypeDefinitions"></a>Object Type Definitions
This section contains the definitions of some standard object types that are transmitted using this API.

#### <a name="userObject"></a>User Object
This is an object containing user information.

##### Fields:
* `username`
* `firstName`
* `middleName`
* `lastName`
* `gender`
* `isStudent`: A boolean.  True if user is a student, false otherwise.
* `isDayStudent`: A boolean.  True if the user is a day student, false otherwise.  (Field may not be included if the user is not a student.)
* `isDean`: A boolean, which is true if the user is a dean, and false otherwise.  (Field may not be included if the user is a student.)
* `profileImageURL`: a url linking to an image of the user
* `graduationYear`: The year the student is scheduled to graduate Exeter. (field null or not included for faculty)
* `dormitory`: The dormitory a student or faculty member is affiliated with (field null or not included for users without dorm affiliation).
* `roomNumber`: The student's (or faculty, if the faculty lives in a dorm) room number (field null or not included for day students or faculty who do not live in a dorm).  Field may not be included.
* `currentlyOnvisitationsRestrictions`: A boolean. True if the user is on vs restrictions when the user object is sent, false if the user is not on vs restrictions at that time.  This will be null if the user is not a student.

---

#### <a name="visitationsObject"></a>Visitations Object
This is an object containing information about a [visitations session](#visitationSessionType).

##### Fields:
* `id`: A unique identifier for the [visitations session](#visitationSessionType).
* `startTime`: The time when the Vs session started (ie. when the first visitor joined Vs) (in the form of milliseconds since Jan. 1, 1970)
* `endTime`: The time when the Vs session ended (ie. when the last visitor left Vs) (in the form of milliseconds since Jan. 1, 1970) (If the Vs haven't ended, this will be null or not included).
* `ongoing`: A boolean.  True if the Vs are currently occurring, false otherwise.
* `automaticallyEnded`: A boolean. Only included if the vs session has ended.  True if it was ended by the server automatically ending it at the end of the day, false if it was ended by user action (the host ending Vs, or all visitors leaving).
* `host`: A [user object](#userObject) containing information about the host of the Vs session.  Note that the dorm and room number info for this object is the room and dorm in which the Vs are occurring.
* `visitorDataRemoved`: A boolean, which may or may not be included. If this field is included and true, it means that information about other visitors who were part of the Vs session was removed before the data was sent to this user, since the user does not have authorization to view the information.  If false or not included, this did not happen.
* `visitors`: An array of [user objects](#userObject), each containing information about a visitor in the Vs session.  The field `roomNumber` is not included for any user object in this array.  Each object in the array, however, has the following additional fields:
  * `timeJoinedVs`: A date and time expressed as milliseconds since Jan. 1, 1970. The time when this visitor joined the Vs session.
  * `timeLeftVs`: A date and time expressed as milliseconds since Jan. 1, 1970. The time when this visitor left the Vs session.  If the visitor hasn't left, this field will be null.
  * `approvedVisitor`: A boolean.  Whether this student is an approved visitor of the host.

---

#### <a name="visitationsRequestObject"></a>Visitations Request Object
This is an object containing information about a visitations request.

##### Fields:
* `id`: A unique identifier for the visitations request.
* `timeRequestIssued`: The date and time (ISO) when the request was issued by the visitor.
* `host`: A [user object](#userObject) containing information about the user to whom this Vs request was sent.
* `visitor`: A [user object](#userObject) containing information about the user who issued the Vs request.  Does not contain the field `roomNumber.`

---

## <a name="termDefinitions"></a>Term definitions
This section contains definitions of a few terms used in the API.

#### <a name="standardPaginationInterfaceTerm"></a>Standard pagination interface
Pagination refers to sending data to the client in "pages", rather than all at once.
For example, if there are 200 database entries that could be returned, rather than sending 200
entries, the server may send only 20 at each request the client makes, with the client
having the ability to choose which entry to start at, so in 10 requests, the client could view
all the data.

The [standard pagination interface](#standardPaginationInterfaceTerm) is the standard syntax used 
in this app for pagination.  Note that this is the pagination interface that feathers uses by
default.  Each method that uses this pagination and this interface makes note of it in its section
of this document.

Here is how it works:

On the URL query for this method (in addition to any other query parameters), the following
fields may be included:
* `$limit`: The maximum number of documents to be returned at once.  The default for this is 10.  The maximum value it may have is 100; if this is set to a greater number, it will default to 100.  (Pro tip: if you just want to see if a document exists, but don't care about its contents, use `$limit=0` to decrease the amount of data sent by the server.)
* `$skip`: The number of documents to skip before the first returned result.  (For example, if this is set to 10, the first result returned will be the 11th one found.)  Defaults to 0.

On the returned JSON file, the following fields will be included in addition to any others
specified on the specific method:
* `limit`: The value used as the limit of the number of documents to send to the client.
* `skip`: The number of documents skipped before the first one sent to the client.
* `total`: The total number of documents which matched the query.  If this is greater than `limit`, not all have been sent.
* Another field will also be included with an array of documents of some sort.

#### <a name="visitationsSessionTerm"></a>Visitations Session
A visitations session is a continuous, uninterrupted period during which Vs are occurring in an individual's room.  The same visitor does not have to be getting Vs for the whole time, as long as (an)other visitor(s) joins the Vs before the first visitor leaves.  The Vs session ends once all visitors have left the room, and at that point, a new Vs session begins the next time a visitor begins to get Vs in the room.
