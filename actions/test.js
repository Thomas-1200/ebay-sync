"use strict";
let datafire = require('datafire');

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      limit: '1000',
    }, context);
    return orderSearchPagedCollection.orders.length;
  },
});
