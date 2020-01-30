"use strict";
let datafire = require('datafire');

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  inputs: [{
    type: "string",
    title: "lastUpdated"
  }],
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      filter: input.lastUpdated,
    }, context);
    return orderSearchPagedCollection;
  },
});
