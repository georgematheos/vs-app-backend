# Timed Events
The visitations app server uses a system of "timed events" to perform operations that should occur at specific times.
For example, currently, visitations sessions automatically end 15 minutes after the time when visitations are no longer
allowed on any given day.  To accomplish this, a timed event is created to end the visitations session at the proper time.

The core of the timed events system is a service on the api app called `timed-events`.
To create a timed event, the server calls the timed events service's `create` method.  The data object
for this request should have all the fields that are stored in a timed-event object
(see [`storate-formats.md`](storate-formats.md) for information on what fields are stored on a timed-events
object), except for `_id` and `timerId` (which will be set later).

This request will result in information about the timed event being stored in a database.  Additionally, a hook
on the timed-events service will initialize a timer to make the event occur at the right time.
This is done using the function `initialize-timed-event-performer`, located at 
`src/lib/initialize-timed-event-performer.js`.  These timers are stored in memory, and will be destroyed if the
server shuts down.  When the server restarts, after the timed-events service is initialized
(in `src/services/timed-events/timed-events.service.js`), the function `initialize-all-timed-event-performers`
(see `src/lib/initialize-all-timed-event-performers.js`) will be called.  This function gets all timed events
from the timed events database, and sets a timer for each one, so they will all be executed at the right time.
If the timed event should have been executed while the server was off, it will be run right away when the server restarts.

When a timed event is executed, it is not automatically deleted.  The operation performed by that timed event
is responsible for deleting the timed event on its own.  While this is slightly inconvenient, it avoids the following issue:

If a timed event is created to modify a resource that may be deleted before the timed event runs, the timed event
must be deleted, or it will throw a not-found error when it runs, and finds that the resource, which has already been deleted,
does not exist.  Similarly, if this is another event which can only occur once (which timed events often trigger),
if it occurs before the timed event, when the timed event runs, an error will be thrown. Therefore the action the timed event
is supposed to perform will typically have to be responsible for deleting the timed event, anyway.  If the timed event is
set to delete itself after its action is performed, this would cause a not-found error, since it would try to delete itself
after performing its action, even though the action itself resulted in the resource's deletion. This would cause a
not-found error.

All timed events which are implemented at the time this document is being written (20170802) are of this sort.
If, in the future, timed events are set where this is not a problem, and the engineer working on this server
wants the initialize-timed-event-performer to set the timed event to be automatically deleted after the action is
performed, this will be easy to implement by creating another field on the timed-events document, or creating
a new `type` for the object, to communicate that that timed event should have autmoatic deletion.

I will give an example of how timed events are used in practice.
When a visitations session is created, a timed event is created to end the visitations session at the end
of the day.  If a user ends visitations before the end of the day, when the timed event is called, it will still try to
end that visitations session, and this will result in an error, since the visitations session has already been ended.
So, when the user ends visitation, the visitations session must delete that timed event.  To know which timed-event to delete,
the server could send a find request to the timed-events service to try to identify which timed-event document corresponds
to ending that visitations request.  Alternatively, to cut down on queries to this service, when the timed event is created,
the visitations service could store the id of this timed event on the visitations object.  This is what the server does,
as it is currently implemented.  In a .then function after creating the timed event, the visitations object stores the id
of the returned document (called `_id`) on the visitations document, in a field called `automaticEndTimedEventId`.
Then, when a visitations session ends, a hook gets this `automaticEndTimedEventId`, and runs the remove method on
the timed-events service with this id.  While this is not strictly necessary, the visitations service also has a .then
function after this that logs that this timed event was deleted successfully.

If a service wants to modify an existing timed event, it may use a patch request, but only two fields may be modified
in this way: the `time` and `timerId` fields.  This is because if anything about the event other than the time it should
be runs changes, it isn't really the same event any more, so another event should be created, rather than an old one
being modified.  When the time field is changed by a patch request like this, the old timer for the old time
is automatically deleted, a new timer is set for the new time, and the timerId for this timer is stored on the
timed-event object.

One more thing to note -- when a timer in node.js is set (using the setTimeout) function, the `timeoutID` it returns 
is a cyclic javascript object that cannot be stored in a database.  But, since it is important to be able to cancel
timers, we need to store these objects somehow.  The server does this by creating an object in memory of containing
all the `timeoutID`s currently in use, and providing a function to store a `timeoutID` in memory, and one to retrieve one
from memory.  The function to store one takes the `timeoutID` as a parameter, and returns what I call a `timerId` - a
number that uniquely identifies that `timeoutID`.  If that `timerId` is passed to the function for retrieving `timeoutID`s,
the function returns the `timeoutID` associated with it.  The code that does this is located at
`src/lib/timer-id-converter`.  This is configured in the file `src/services/timed-events/timed-events.service.js`.
The object containing the functions for conversion is stored on the api app object, so it could be accessed from
anywhere, though in reality the timed-events service has hooks that handles setting and canceling timers,
and this should almost certainly be the only place where such conversion is necessary.
