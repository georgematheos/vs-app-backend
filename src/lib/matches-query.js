/**
* matches-query
* This function returns true if the given object matches a given query.
* The first parameter is the hook object.
* The second parameter is the object to check for matching the queries.
* The remaining parameters are query objects. A variable number may be provided.
* Each query object should contain some number of fields, each containing a value specifier in the format
* used in `src/lib/get-value-from-hook`.
* For each field on a query object, this function will check whether the field on the object
* has a field with the same name, containing the same value as that specified by the included value specifier.
* If it does not, the object does not match this query.
* The function will return true if the object matches any of the provided query objects,
* and false otherwise.
*/

const getValueFromHook = require('./get-value-from-hook');

function matchesQuery(hook, obj, ...queries) {
  // check each query and see if it matches obj
  queryLoop: for (let query of queries) {
    // for this query, check each property included
    for (let fieldName in query) {
      if (query.hasOwnProperty(fieldName)) { // make sure property isn't from object prototype
        // now check if the field value provided matches that on obj
        // if obj doesn't have this field, or its value doesn't match,
        // this query is not a match, so continue the queryLoop and check the next query
        if (obj[fieldName] !== getValueFromHook(hook, query[fieldName])) { // make sure to extract value using getValueFromHook
          continue queryLoop;
        }
      }
    }
    // if we get here, all fields in the query matched the fields in obj, so return true
    return true;
  }
  // if we get here and haven't returned true, it means that obj didn't match any query, so return false
  return false;
}

module.exports = matchesQuery;
