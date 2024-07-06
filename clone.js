const { MongoClient } = require("mongodb");

const sourceMongoURL = "mongodb://127.0.0.1:27017/agl0";
const targetMongoURL = "mongodb://127.0.0.1:27017/agl_testing";

async function cloneDatabase(sourceMongoURL, targetMongoURL) {
  const sourceClient = new MongoClient(sourceMongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const targetClient = new MongoClient(targetMongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDb = sourceClient.db();
    const targetDb = targetClient.db();

    const collections = await sourceDb.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Cloning collection: ${collectionName}`);

      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);

      await targetCollection
        .drop()
        .catch((err) =>
          console.log(
            `Collection ${collectionName} does not exist in target DB, skipping drop`
          )
        );

      const docs = await sourceCollection.find().toArray();
      if (docs.length > 0) {
        await targetCollection.insertMany(docs);
      }
    }

    console.log(
      `Cloning completed from ${sourceDb.databaseName} to ${targetDb.databaseName}`
    );
  } catch (error) {
    console.error("Error cloning database:", error);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

cloneDatabase(sourceMongoURL, targetMongoURL);
