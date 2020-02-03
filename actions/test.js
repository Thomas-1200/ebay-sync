"use strict";
let datafire = require('datafire');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://iyd-admin:tcQrNRIkWvxz5dPp4LWp0PdRhTZAn5lx1KSeDtkR42DDMkwppZGsJdj3IuI1gvrl@cluster0-hcq6x.mongodb.net";
let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = new datafire.Action({
  handler: async (input, context) => {
    await client.connect();
    let collection = await client.db("itsyourdayboutique").collection("orders");
    return collection.find({}).toArray();
  },
});
