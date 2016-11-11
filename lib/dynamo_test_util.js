var DynamoTestUtil = function(doc_client) {
  var self = this;
  self.doc_client = doc_client;
  self.client = doc_client.service;

  self.promise = function() {
    return require("./promise_wrapper").wrap(Object.create({}), self, ['getItemsCallback']);
  };

  self.createTable = function(tablename, schema, records, done) {
    self.client.createTable(schema, function(err, data) {
      if (err) {
        done(err);
      } else {
        self.client.waitFor('tableExists', {TableName: tablename}, function(err, data) {
          if (err) {
            done(err);
          } else {
            self.loadFixtures(tablename, records, done);
          }
        });
      }
    });
  };

  self.loadFixtures = function(tablename, records, done) {
    if (records.length > 0) {
      var requests = records.map(function (record) {
        return { PutRequest: { Item: record } };
      });
      var batches = [];
      while (requests.length > 0) {
        batches[batches.length] = requests.splice(0,25);
      }
      var completed = 0;
      var errors = 0;
      batches.forEach(function(batch) {
        var reqItems = {};
        reqItems[tablename] = batch;
        self.doc_client.batchWrite({RequestItems: reqItems}, function(err) {
          completed++;
          if (err) {
            errors++;
          }
          if (completed == batches.length) {
            if (errors > 0) {
              done(new Error(`${errors} fixture load batches failed`));
            } else {
              done();
            }
          }
        });
      });
    } else {
      done();
    }
  };

  self.deleteTable = function(tablename, done) {
    self.client.deleteTable({TableName: tablename}, function(err, data) {
      if (err) {
        done(err);
      } else {
        self.client.waitFor('tableNotExists', {TableName: tablename}, done);
      }
    });
  };

  self.getItems = function(tablename, keys, callback) {
    if (keys.length > 0) {
      var batches = [];
      while (keys.length > 0) {
        batches[batches.length] = keys.splice(0,100);
      }
      var completed = 0;
      var errors = 0;
      var items = [];
      batches.forEach(function(batch) {
        var reqItems = {};
        reqItems[tablename] = {Keys: batch};

        self.doc_client.batchGet({RequestItems: reqItems}, function(err, data) {
          completed++;
          if (err) {
            errors++;
          } else {
            items = items.concat(data['Responses'][tablename]);
          }
          if (completed == batches.length) {
            if (errors > 0) {
              callback(new Error(`${errors} batches failed`), items);
            } else {
              callback(null, items);
            }
          }
        });
      });
    } else {
      callback(null, []);
    }
  };

  self.deleteItems = function(tablename, keys, done) {
    if (keys.length > 0) {
      var batches = [];
      while (keys.length > 0) {
        batches[batches.length] = keys.splice(0,25);
      }
      var completed = 0;
      var errors = 0;
      var items = [];
      batches.forEach(function(batch) {
        var reqItems = {};
        reqItems[tablename] = batch.map(function(key) {
          return {DeleteRequest: {Key: key}};
        });
        self.doc_client.batchWrite({RequestItems: reqItems}, function(err) {
          completed++;
          if (err) {
            errors++;
          }
          if (completed == batches.length) {
            if (errors > 0) {
              done(new Error(`${errors} delete batches failed`));
            } else {
              done();
            }
          }
        });
      });
    } else {
      done();
    }
  };

  self.getItemsCallback = function(tablename, keys, done, callback) {
    return function(err, data) {
      if (err) {
        return done(err);
      } else {
        self.getItems(tablename, keys, function(err, data) {
          if (err) {
            done(err);
          } else {
            callback(data);
          }
        });
      }
    };
  };
};

module.exports = {
  create: function(doc_client) { return new DynamoTestUtil(doc_client); },
};
