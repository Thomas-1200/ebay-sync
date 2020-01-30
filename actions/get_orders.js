"use strict";
let datafire = require('datafire');
let message = '';
let date = new Date();
date.setDate(date.getDate() - 1);
let filter = 'lastmodifieddate:[' + date.toISOString() + '..]';
let MongoClient = require('mongodb').MongoClient;
let uri = "mongodb+srv://test:test@cluster0-hcq6x.mongodb.net";
let updated = 0;
let added = 0;
let ordersFound = 0;
let needsUpdating = [];
let needsInserting = [];

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      filter: filter,
    }, context);
    let client = new MongoClient("mongodb+srv://test:test@cluster0-hcq6x.mongodb.net", { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect() 
    let collection = await client.db("itsyourdayboutique").collection("orders");
    ordersFound = orderSearchPagedCollection.orders.length;
    for(let i = 0; i < orderSearchPagedCollection.orders.length; i++) {
      let item = orderSearchPagedCollection.orders[i];
      let found = await collection.findOne({orderId: item.orderId});
       
      if (found && found.orderId === item.orderId) {
        needsUpdating.push(item);
      } else {
      	needsInserting.push(item);
      }
    }
    
    for (let i = 0; i < needsUpdating.length; i++) {
    	await collection.replaceOne({orderId:needsUpdating[i].orderId}, needsUpdating[i]);
      	updated++;
    }
    
    for (let i = 0; i < needsInserting.length; i++) {
    	await collection.insertOne(needsInserting[i]);
        added++;
    }
    
    message = "orders found: " + ordersFound + ", orders updated: " + updated + ", orders inserted: " + added;
    return message;
    },
});