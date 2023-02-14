import mongodb from '../../../../../vendor/mongodb.min.js';

const { MongoClient, BSON } = mongodb;
const client = new MongoClient('mongodb://0.0.0.0:27017');

await client.connect();

const db = client.db('ppp');
const collection = db.collection('app');

// const insertResult = await collection.insertMany([
//   { a: 1 },
//   { a: [2] },
//   { a: '3' }
// ]);
//
// console.log(insertResult);

console.log(BSON.ObjectId)
