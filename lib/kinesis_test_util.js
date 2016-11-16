var KinesisTestUtil = function(client) {
  var self = this;
  self.client = client;

  self.promise = function() {
    return require("./promise_wrapper").wrap(Object.create({}), self);
  };

  self.createStream = function(streamName, done, numShards) {
    self.client.createStream({ShardCount: numShards || 1, StreamName: streamName}, (err, data) => {
      if (err) {
        done(err);
      } else {
        self.client.waitFor('streamExists', {StreamName: streamName}, (err, data) => {
          if (err) {
            done(err);
          } else {
            done(null, data.StreamDescription.Shards);
          }
        });
      }
    });
  };

  self.deleteStream = function(streamName, done) {
    self.client.deleteStream({StreamName: streamName}, (err, data) => {
      if (err) {
        done(err);
      } else {
        waitForDelete(streamName, done);
      }
    });
  };

  function waitForDelete(streamName, done) {
    self.client.describeStream({StreamName: streamName}, (err, data) => {
      if (err) {
        if (err.code === 'ResourceNotFoundException') {
          done(null, 'deleted');
        } else {
          done(err);
        }
      } else {
        waitForDelete(streamName, done);
      }
    });
  };

  self.getShards = function(streamName, done) {
    self.client.describeStream({StreamName: streamName}, (err, data) => {
      if (err) {
        done(err);
      } else {
        done(null, data.StreamDescription.Shards);
      }
    })
  };

  self.getRecords = function(streamName, shards, done) {
    var completed = 0;
    var errors = 0;
    var records = [];
    shards.forEach((shard) => {
      getRecordsForShard(streamName, shard, (err, data) => {
        completed++;
        if (err) {
          errors++;
        } else {
          records = records.concat(data);
        }
        if (completed === shards.length) {
          done((errors > 0) ? 'error' : null, records);
        }
      });
    });
  };

  function getRecordsForShard(streamName, shard, done) {
    var params = {
      ShardId: shard.ShardId,
      StreamName: streamName,
      ShardIteratorType: 'AFTER_SEQUENCE_NUMBER',
      StartingSequenceNumber: shard.SequenceNumberRange.StartingSequenceNumber
    };
    self.client.getShardIterator(params, (err, data) => {
      if (err) {
        done(err);
      } else {
        self.client.getRecords({ShardIterator: data.ShardIterator, Limit: 1000}, (err, data) => {
          if (err) {
            done(err);
          } else {
            try {
              done(null, data.Records.map((record) => JSON.parse(new Buffer(record.Data, 'base64').toString('ascii'))));
            } catch (err) {
              done(err);
            }
          }
        });
      }
    })
  };
};

module.exports = {
  create: (client) => new KinesisTestUtil(client),
};