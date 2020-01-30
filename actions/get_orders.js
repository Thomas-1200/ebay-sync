"use strict";
let datafire = require('datafire');

let ebay_sell_fulfillment = require('@datafire/ebay_sell_fulfillment').actions;
module.exports = new datafire.Action({
  inputs: [{
    type: "string",
    title: "lastUpdated",
    default: "lastmodifieddate:[2020-01-01T00:00:00.001Z..]"
  }],
  handler: async (input, context) => {
    let orderSearchPagedCollection = await ebay_sell_fulfillment.getOrders({
      filter: input.lastUpdated,
    }, context);
    return orderSearchPagedCollection;
  },
});
