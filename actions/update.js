"use strict";
let datafire = require('datafire');
let MongoClient = require('mongodb').MongoClient;
let uri = "mongodb+srv://test:test@cluster0-hcq6x.mongodb.net";
let client = new MongoClient(uri, { useNewUrlParser: true });

module.exports = new datafire.Action({
  inputs: [{
    type: "object",
    title: "item"
  }],
  handler: async (input, context) => {
    client.connect(err => {
      const collection = client.db("itsyourdayboutique").collection("orders");
      // perform actions on the collection object
      collection.update({orderId:item.orderId}, item);
      client.close();
    })
  },
});
