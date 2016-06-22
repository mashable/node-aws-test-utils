# Node Test Utils for AWS

Provides test utils for writing tests that interact with AWS resources.

## Dynamo

`require('aws-test-utils').dynamo(dynamo_doc_client)`

Pass a [Dynamo Doc Client](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) to create dynamo test util object. Provides utility methods to create/delete tables, load fixtures, get/delete items from dynamo table. You will need to configure AWS credentials as per [AWS NodeJS SDK documentation](http://aws.amazon.com/developers/getting-started/nodejs/).

## Lambda

`require('aws-test-utils').lambda`

Provides utility methods to generate kinesis and dynamo stream payloads. 
