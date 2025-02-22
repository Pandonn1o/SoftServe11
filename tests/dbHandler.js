const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const Article = require('../models/articleModel');

let mongod;

module.exports.imporDefaultData = async () => {
  const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/articles-test-data.json`, 'utf-8')
  );
  try {
    await Article.create(tours);
  } catch (err) {
    console.log(err);
  }
};

module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'verifyMongooseSprint',
  });

  await this.imporDefaultData();
};

module.exports.closeDatabase = async () => {
  await mongod.stop();
  await mongoose.connection.close();
};

module.exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;

  Object.keys(collections).forEach(async (key) => {
    const collection = collections[key];
    await collection.deleteMany();
  });
};
