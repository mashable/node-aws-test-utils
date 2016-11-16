module.exports = {
  dynamo: require('./dynamo_test_util').create,
  lambda: require('./lambda_test_util'),
  kinesis: require('./kinesis_test_util').create,
};
