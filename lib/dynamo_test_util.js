var DynamoTestUtil = function(doc_client) {
  var self = this;
  self.doc_client = doc_client;
  self.client = doc_client.service;

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
      var reqItems = {};
      reqItems[tablename] = requests;
      self.doc_client.batchWrite({RequestItems: reqItems}, done);
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
      var reqItems = {};
      reqItems[tablename] = {Keys: keys};

      self.doc_client.batchGet({RequestItems: reqItems}, function(err, data) {
        if (err) {
          callback(err);
        } else {
          callback(null, data['Responses'][tablename]);
        }
      });
    } else {
      callback(null, []);
    }
  };

  self.deleteItems = function(tablename, keys, done) {
    if (keys.length > 0) {
      var reqItems = {};
      reqItems[tablename] = keys.map(function(key) {
        return {DeleteRequest: {Key: key}};
      });
      self.doc_client.batchWrite({RequestItems: reqItems}, done);
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
