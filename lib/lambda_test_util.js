var attr = require('dynamodb-data-types').AttributeValue;

var LambdaTestUtil = function() {
  var self = this;

  self.kinesisPayload = function(events) {
    return self.jsonPayload({
      "Records": events.map(function(event) {
        return {
            "kinesis": {
                "partitionKey": "partitionKey-3",
                "kinesisSchemaVersion": "1.0",
                "data": new Buffer(JSON.stringify(event)).toString("base64"),
                "sequenceNumber": "49545115243490985018280067714973144582180062593244200961"
            },
            "eventSource": "aws:kinesis",
            "eventID": "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
            "invokeIdentityArn": "arn:aws:iam::account-id:role/testLEBRole",
            "eventVersion": "1.0",
            "eventName": "aws:kinesis:record",
            "eventSourceARN": "arn:aws:kinesis:us-west-2:35667example:stream/examplestream",
            "awsRegion": "us-west-2"
        };
      }),
    });
  };

  self.dynamoStreamPayload = function(key_fields, items, old_items) {
    var id = 0;
    return self.jsonPayload({
      "Records": items.map(function(item, index) {
        var keys = {};
        key_fields.forEach(function(field) {
          keys[field] = item[field]
        });
        var payload = {
           "eventID":String(id++),
           "eventName":"INSERT",
           "eventVersion":"1.0",
           "eventSource":"aws:dynamodb",
           "awsRegion":"us-east-1",
           "dynamodb":{
              "Keys": attr.wrap(keys),
              "NewImage": attr.wrap(item),
              "SequenceNumber":"111",
              "SizeBytes":26,
              "StreamViewType":"NEW_IMAGE"
           },
           "eventSourceARN":"stream-ARN"
        };

        if (old_items && old_items[index]) {
          payload.eventName = "MODIFY";
          payload.dynamodb.OldImage = attr.wrap(old_items[index]);
          payload.dynamodb.StreamViewType = "NEW_AND_OLD_IMAGES";
        }

        return payload;
      }),
    });
  };

  self.jsonPayload = function(json) {
    return JSON.stringify(json);
  }
};

module.exports = new LambdaTestUtil();
