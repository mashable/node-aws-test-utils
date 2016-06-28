# Change Log
All notable changes to this project will be documented in this file.

## [1.1.1] - 2016-06-27
### Updated
- Add batching to limit number of items fetched/updated on dynamo batchGet/batchWrite method calls

## [1.1.0] - 2016-06-24
### Added
- Uses library [dynamodb-data-types](https://www.npmjs.com/package/dynamodb-data-types) to serialize items and keys in dynamo streams payload generator for lamda test util
- Adds support for list, set, bool etc dynamo db data types