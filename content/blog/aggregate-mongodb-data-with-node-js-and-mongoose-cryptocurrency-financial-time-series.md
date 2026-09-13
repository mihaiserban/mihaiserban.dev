---
slug: aggregate-mongodb-data-with-node-js-and-mongoose-cryptocurrency-financial-time-series
title: How to generate cryptocurrency time intervals using MongoDB Aggregation Framework and Node.js
description: "Group cryptocurrency ticker snapshots into five-minute price summaries with MongoDB, and distinguish rolling-volume changes from traded volume."
date: "2017-08-24T00:00+02:00"
hidden: false
tags:
  - NodeJS
  - MongoDB
---

![bitcoin](/images/blog/0_m4PdT9e8rKaVnWvD.jpeg)

This example groups stored cryptocurrency ticker snapshots into five-minute price summaries using MongoDB's aggregation pipeline.

> **Updated 2026-09-13:** The original pipeline had undefined variables and did not sort ticks before using `$first` and `$last`. The percentage calculation now runs inside the aggregation pipeline. Bitfinex's ticker `volume` is a rolling 24-hour value, so its change is labeled accordingly rather than presented as volume traded in the interval.

The data here comes from Bitfinex ticker snapshots. A snapshot includes the latest price and rolling 24-hour statistics; it is not a record of every trade. Bitfinex also provides [candles](https://docs.bitfinex.com/reference/rest-public-candles) for interval-based market data, so use that endpoint when exchange-generated candles meet your needs.

Here is the historical ticker payload used in this example:

```json
{
  "mid":"244.755",
  "bid":"244.75",
  "ask":"244.76",
  "last_price":"244.82",
  "low":"244.2",
  "high":"248.19",
  "volume":"7842.11542563",
  "timestamp":"1444253422.348340958"
}
```

The `low`, `high` and `volume` fields cover a rolling 24-hour window. We’ll group the sampled `last_price` values by time. Missing snapshots can hide price extremes, so the result is a summary of the collected samples rather than a complete trade-based candle.

Store the data in MongoDB, converting the source timestamp from Unix seconds to a JavaScript `Date` for `created_at`. Otherwise the schema's default records ingestion time, which can put delayed snapshots into the wrong interval. The snippets below assume an established Mongoose connection.

Our model looks like this:

```
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tickerSchema = new Schema({
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

const Ticker = mongoose.model('Ticker', tickerSchema);
```

Now that we have the data store we can go ahead and create our [Mongo Aggregation pipeline](https://docs.mongodb.com/manual/aggregation/) to extract the ticks in time intervals we need.

```
const pair = 'tETHUSD'
const exchange = 'Bitfinex'
const periodMinutes = 5; // time interval to process data
const minutesAgo = 30;
let startDate = new Date()
startDate.setMinutes(startDate.getMinutes() - minutesAgo)
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
        $sort: {
          created_at: 1,
          _id: 1
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
                        1000 * 60 * periodMinutes
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
          period_change_perc: {
            $cond: [
              { $eq: ['$first_close', 0] },
              null,
              {
                $multiply: [
                  { $subtract: [{ $divide: ['$last_close', '$first_close'] }, 1] },
                  100
                ]
              }
            ]
          },
          open: '$first_close',
          close: '$last_close',
          rolling_volume_change: { $subtract: [ '$last_volume', '$first_volume' ] },
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
Ticker.aggregate(operations)
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

Our aggregation pipeline consists of 5 operations:

1. __$match__ : filters the tick data based on date, symbol and exchange
2. __$sort__ : orders ticks chronologically before `$first` and `$last` are used. `_id` makes ties deterministic.
3. __$group__ : groups the data returned by the match operation into periods, in our case 5 minutes. Here we also compute additional value such as the new highs and lows for the periods, first close, last close, first volume, last volume.
4. __$project__ : the data resulting from the `$group` operation is passed into the `$project` phase, where we use [operators](https://docs.mongodb.com/manual/reference/operator/aggregation/) to compute the final output. For example, `period_change` is *last_close* - *first_close*, `period_change_perc` is that change as a percentage of *first_close*, and `rolling_volume_change` is the change in the ticker's rolling 24-hour volume.
5. __$sort__ : sorts the resulting periods in ascending order

Output of our aggregation is an array of aggregated tickers at 5 minute intervals:

```
[ 
  { _id: 2017-08-24T07:15:00.000Z,
    period_change: 0.2400000000000091,
    period_change_perc: 0.07518796992481488,
    open: 319.2,
    close: 319.44,
    rolling_volume_change: -52.8511199200002,
    high: 319.44,
    low: 319.2 },
  { _id: 2017-08-24T07:20:00.000Z,
    period_change: 0.07999999999998408,
    period_change_perc: 0.025043826696714275,
    open: 319.44,
    close: 319.52,
    rolling_volume_change: 18.845093469994026,
    high: 319.52,
    low: 319.44 } 
 ]
```

References:

**Aggregation - MongoDB Manual 3.4**
[Aggregation operations process data records and return computed results.](https://docs.mongodb.com/manual/aggregation/)

**General**
[Current Version Bitfinex Websocket API version is 2.0](https://docs.bitfinex.com/v2/docs/ws-general)
