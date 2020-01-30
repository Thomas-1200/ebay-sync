"use strict";
let datafire = require('datafire');

let date = new Date();
date.setDate(date.getDate() - 1);
let filter = 'lastmodifieddate:[' + date.toISOString() + '..]';

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      filter: filter,
    }, context);
    return orderSearchPagedCollection;
  },
});
