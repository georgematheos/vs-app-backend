/**
* populate-users
* This file provides a method to populate the users database with a small selection of users for testing.
*
* Read ./utilities.md for usage information.
*/

function populateUsers(app) {
  const users = app.service('/users');

  Promise.all([
    users.create({
      username: 'user0',
      password: 'password',
      firstName: 'User',
      middleName: 'Number',
      lastName: 'Zero',
      gender: 'Fluid',
      isStudent: true,
      isDayStudent: true,
      isDean: false,
      profileImageUrl: 'http://s3.amazonaws.com/nvest/Blank_Club_Website_Avatar_Gray.jpg',
      graduationYear: 2018,
      dormitory: null,
      roomNumber: null
    })
  ])
  .then(results => {
    console.log('The following users have been created:');
    for (let result of results) {
      console.log(result);
    }
  })
  .catch(err => {
    console.log('An error occurred while creating users:');
    console.log(err);
  });
}

module.exports = populateUsers
