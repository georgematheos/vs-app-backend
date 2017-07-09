#!/usr/bin/env node
/**
* run-utility
* This script runs a utility specified in a command line argument.
* For information on usage, see ./utilities.md.
*/

// import the api app
const apiApp = require('../src/api-app');

// check for correct usage
if (process.argv.length !== 3) {
  console.log('Incorrect usage.');
  console.log('Correct usage is: node utilities/run-utility.js utility-name');
  process.exit(1);
}

// import the utility specified in command line args
const utility = require('./' + process.argv[2]);

// run the utility function
utility(apiApp);
