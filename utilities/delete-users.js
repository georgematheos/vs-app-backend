/**
* delete-users
* This file provides a method to delete all users currently in the users database.
*
* Read ./utilities.md for usage information.
*/

function deleteUsers(app) {
  const users = app.service('/users');

  // first, get all user information
  users.find()
  .then(results => {
    console.log('User information successfully retrieved.');

    // then, remove each user found by ID
    for (let user of results.data) {
      users.remove(user._id, {})
      .then(val => {
        console.log('Successfully deleted user with username ' + user.username);
      })
      .catch(err => {
        console.log('An error occurred while attempting to remove the user with the username ' + user.username + ':');
        console.log(err);
      });
    }

    // notify user if not all results were retrieved and thus not all users were deleted
    // TODO: actually solve this problem...
    if (results.total > results.data.length) {
      console.log('NOTE: not all users have been deleted. If the delete-users utility is run enough times, all users will be deleted. Alternatively, the delete-users utility could be modified to delete more users at a time.');
    }
  })
  .catch(err => {
    console.log('An error occurred while attempting to get user information from users database:');
    console.log(err);
  });
}

module.exports = deleteUsers;
