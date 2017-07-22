/**
* checkQueryMatch
* This function returns true if the given object matches a given query.
* The first parameter is the hook object.
* The second parameter is the object to check for matching the queries.
* The remaining parameters are query objects. A variable number may be provided.
* Each query object should contain some number of fields, each containing a value specifier in the format
* used in `src/lib/get-value-from-hook`.
* For each field on a query object, this function will check whether the field on the object
* has a field with the same name, containing the same value as that specified by the included value specifier.
* If it does not, the object does not match this query.
* The function will return a promise that resolves to true if the object matches any of
* the provided query objects, and false otherwise.
*/

const getValueFromHook = require('./get-value-from-hook');

function checkQueryMatch(hook, obj, ...queries) {
  let queryLoopPromises = []; // an array
  let aQueryMatches = false; // a boolean; whether the obj matches ANY query object; start assuming false and change if needed

  // check each query and see if the obj matches it
  queryLoop: for (let query of queries) {
    let fieldLoopPromises = [];
    let queryMatches = true; // start out assuming the obj matches query, and change it if a field doesn't match

    // for this query, check each property included
    fieldLoop: for (let fieldName in query) {
      if (query.hasOwnProperty(fieldName)) { // make sure field isn't on prototype

        fieldLoopPromises.push(getValueFromHook(hook, query[fieldName])
        .then(value => {
          // if obj[fieldName] doesn't have the value of the query object, the query doesn't match
          if (obj[fieldName] !== value) {
            queryMatches = false;
          }
        }));
      }
    }
    // After all promises have resolved, if queryMatches is still true, the obj mathced the query,
    // so set aQueryMatches to true
    queryLoopPromises.push(Promise.all(fieldLoopPromises)
    .then(() => {
      if (queryMatches) aQueryMatches = true;
    }));
  }

  // after all query loop promises resolve, return a promise resolving to whether the obje matches any query
  return Promise.all(queryLoopPromises)
  .then(() => {
    return aQueryMatches;
  });
}

module.exports = checkQueryMatch;
