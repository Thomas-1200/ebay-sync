"use strict";
let datafire = require('datafire');
let message = '';
let date = new Date();
date.setDate(date.getDate() - 1);
let filter = 'lastmodifieddate:[' + date.toISOString() + '..]';
let MongoClient = require('mongodb').MongoClient;
let uri = "mongodb+srv://iyd-admin:tcQrNRIkWvxz5dPp4LWp0PdRhTZAn5lx1KSeDtkR42DDMkwppZGsJdj3IuI1gvrl@cluster0-hcq6x.mongodb.net";
let updated = 0;
let added = 0;
let ordersFound = 0;
let needsUpdating = [];
let needsInserting = [];
let newCustomers = [];
let existingCustomers = [];
let newCustomersAdded = 0;
let existingCustomersUpdated = 0;

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      filter: filter,
    }, context);
    let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect()
    let collection = await client.db("itsyourdayboutique").collection("orders");
    let customerCollection = await client.db("itsyourdayboutique").collection("customers");
    ordersFound = orderSearchPagedCollection.orders.length;
    for(let i = 0; i < orderSearchPagedCollection.orders.length; i++) {

      let item = orderSearchPagedCollection.orders[i];
      let customer = {
        username: item.buyer.username,
        fullname: item.fulfillmentStartInstructions[0].shippingStep.shipTo.fullName || "",
        contact: {
        	email: item.fulfillmentStartInstructions[0].shippingStep.shipTo.email || "",
          	phone: item.fulfillmentStartInstructions[0].shippingStep.shipTo.primaryPhone.phoneNumber || "",
          	address: item.fulfillmentStartInstructions[0].shippingStep.shipTo.contactAddress || {}
        },
        orders: [item.orderId],
        creationDate: item.creationDate,
        lastModifiedDate: item.lastModifiedDate
      }
      let found = await collection.findOne({orderId: item.orderId});
      let customerFound = await customerCollection.findOne({username: customer.username});
      if (found && found.orderId === item.orderId) {
        needsUpdating.push(item);
      } else {
      	needsInserting.push(item);
      }

      if (customerFound && customerFound.username === customer.username) {
       	existingCustomers.push([customer, customerFound]);
      } else {
      	newCustomers.push(customer);
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

    for (let i = 0; i < existingCustomers.length; i++) {
    	let existingRecord = existingCustomers[i][1];
      	let newRecord = existingCustomers[i][0];

      	if (existingRecord.fullname.length > 0 && newRecord.fullname.length < 1) {
        	newRecord.fullname = existingRecord.fullname;
        }
      	if (existingRecord.contact.email.length > 0 && newRecord.contact.email.length < 1) {
        	newRecord.contact.email = existingRecord.contact.email;
        }
      	if (existingRecord.contact.phone.length > 0 && newRecord.contact.phone.length < 1) {
        	newRecord.contact.phone = existingRecord.contact.phone;
        }
      	if (existingRecord.contact.address.addressLine1.length > 0 && newRecord.contact.address.addressLine1.length < 1) {
        	newRecord.contact.address = existingRecord.contact.address;
        }
      	if (existingRecord.creationDate) {
      		newRecord.creationDate = existingRecord.creationDate;
        }
		if (existingRecord.orders.indexOf(newRecord.orders[0]) === -1) {
      		newRecord.orders.push(...existingRecord.orders);
        }
      	await customerCollection.replaceOne({username:newRecord.username}, newRecord);
      	existingCustomersUpdated++
    }

    for (let i = 0; i < newCustomers.length; i++) {
    	await customerCollection.insertOne(newCustomers[i]);
      	newCustomersAdded++
    }

    message = "orders found: " + ordersFound + ", orders updated: " + updated + ", orders inserted: " + added + ", customers updated: " + existingCustomersUpdated + ", customers added: " + newCustomersAdded;
    return message;
    },
});