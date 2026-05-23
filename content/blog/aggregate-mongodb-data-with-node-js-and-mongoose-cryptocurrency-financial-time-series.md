---
slug: aggregate-mongodb-data-with-node-js-and-mongoose-cryptocurrency-financial-time-series
title: How to generate cryptocurrency time intervals using MongoDB Aggregation Framework and Node.js
description: "Let's use MongoDB Aggregation Framework to track volume changes at 1/5/30 minutes intervals."
date: "2017-08-24T00:00+02:00"
hidden: false
tags:
  - NodeJS
  - MongoDB
---

![bitcoin](/images/blog/0_m4PdT9e8rKaVnWvD.jpeg)

Cryptocurrency is known for having major price swings, big players often do what’s called a pump and dump. They come into the markets with billions of dollars, buy a lot of tokens and steadily increase the price, create FOMO (fear of missing out), buying pressure, and then dump the tokens at a higher price making a big profits.

If we wanted to analyze this kind of market movements we’ll need to gather data from somewhere.

Fortunately exchanges provide REST and socket APIs for their market data, but mostly include 24h changes, and no method to retrieve smaller intervals such as 1 minute data, 5 minute, 30 minute or more.
We’ll use [Bitfinex](https://docs.bitfinex.com/v1/reference) ticker data for this example.

What is ticker data? A tick is a measure of the minimum upward or downward movement in the price of a security or it can also refer to the change in the price of a security from trade to trade.
Example of a tick provided by Bitfinex:

```
{
  "mid":"244.755", (bid + ask) / 2
  "bid":"244.75", Innermost bid
  "ask":"244.76", Innermost ask
  "last_price":"244.82", The price at which the last order executed
  "low":"244.2", Lowest trade price of the last 24 hours
  "high":"248.19", Highest trade price of the last 24 hours
  "volume":"7842.11542563", Trading volume of the last 24 hours
  "timestamp":"1444253422.348340958" The timestamp at which this information was valid
}
```

As you can see the data provided by Bitfinex represents mostly 24h changes, highs and lows for the day, volume etc. We’re interested in the timestamp and last_price, which reflect the price of the asset at the current time.

We’ll take all this data and store it in a MongoDB database.

Our model looks like this:

```
var tickerSchema = new Schema({
  bid: Number,
  bid_size: Number,
  ask: Number,
  ask_size: Number,
  daily_change: Number,
  daily_change_perc: Number,
  last_price: Number,
  volume: Number,
  high: Number,
  low: Number,
  created_at: { type: Date, required: true, default: Date.now },
  symbol: String,
  exchange: String
});
```

Now that we have the data store we can go ahead and create our [Mongo Aggregation pipeline](https://docs.mongodb.com/manual/aggregation/) to extract the ticks in time intervals we need.

```
const pair = 'tETHUSD'
const exchange = 'Bitfinex'
const periods = 5; //time intervals to process data
const minutesAgo = 30;
let startDate = new Date()
startDate.setMinutes(timeAgo.getMinutes()-minutesAgo)
const endDate = new Date()
const operations = [
      {
        $match: {
          created_at: {$gte: startDate, $lt: endDate},
          symbol: pair,
          exchange: exchange
        }
      },
      {
        $group: {
          _id: {
            $add: [
                { $subtract: [
                    { $subtract: [ "$created_at", new Date(0) ] },
                    { $mod: [
                        { $subtract: [ "$created_at", new Date(0) ] },
                        1000 * 60 * period
                    ]}
                ]}, new Date(0)]
          },
          first_close: {$first: "$last_price"},
          last_close: {$last: "$last_price"},
          first_volume: {$first: "$volume"},
          last_volume: {$last: "$volume"},
          high: {$max: "$last_price"},
          low: {$min: "$last_price"},
        }
      },
      {
        $project: {
          _id: 1,
          period_change: { $subtract: [ '$last_close', '$first_close' ] },
          period_change_perc: (1 - ('$first_close' / '$last_close')),
          open: '$first_close',
          close: '$last_close',
          volume: { $subtract: [ '$last_volume', '$first_volume' ] },
          high: '$high',
          low: '$low'
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ];
Ticker.aggregate(operations,function(err, results) {
});
```

Our aggregation pipeline consists of 4 operations:

1. __$match__ : filters the tick data based on date, symbol and exchange
2. __$group__ : groups the data returned by the match operation into periods, in our case 5 minutes. Here we also compute additional value such as the new highs and lows for the perios, first close, last close, first volume, last volume. All this data can be extracted from the last close price and volume of the ticker.
3. __$project__ : the data resulted from the $group operation is passed into the $project phase, where we use [operators](https://docs.mongodb.com/manual/reference/operator/aggregation/) to compute the final output. For example period_change is *last_close*-*first_close*
4. __$sort__ : Make sure we sort the periods in ascending order

Success!

Output of our aggregation is an array of aggregated tickers at 5 minute intervals:

```
[ 
  { _id: 2017-08-24T07:15:00.000Z,
    period_change: 0.2400000000000091,
    open: 319.2,
    close: 319.44,
    volume: -52.8511199200002,
    high: 319.44,
    low: 319.2 },
  { _id: 2017-08-24T07:20:00.000Z,
    period_change: 0.07999999999998408,
    open: 319.44,
    close: 319.52,
    volume: 18.845093469994026,
    high: 319.52,
    low: 319.44 } 
 ]
```

P.S. If you ❤️ this, make sure to follow me on [Twitter](https://twitter.com/MihaiSerban), and share this with your friends 😀🙏🏻

References:

**Aggregation - MongoDB Manual 3.4**
[Aggregation operations process data records and return computed results.](https://docs.mongodb.com/manual/aggregation/)

**General**
[Current Version Bitfinex Websocket API version is 2.0](https://docs.bitfinex.com/v2/docs/ws-general)
