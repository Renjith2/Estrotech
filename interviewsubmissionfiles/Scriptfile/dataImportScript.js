const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri);

async function generateData() {
  try {
    await client.connect();
    const db = client.db('Internetofthings'); // mention your database name

    // Create time series collections for analytics and uptime data
    await db.createCollection('analyticsData', {
      timeseries: {
        timeField: 'timestamp',  
        granularity: 'minutes',
      },
    });

    await db.createCollection('uptimeData', {
      timeseries: {
        timeField: 'timestamp',
        granularity: 'hours',
      },
    });

    // Arrays to hold generated data
    let analyticsData = [];
    let uptimeData = [];

    // Generate data over 2 months
    const startDate = new Date('2024-06-01T00:00:00Z').getTime();
    const endDate = new Date('2024-08-01T00:00:00Z').getTime();
    const deviceId = 'device123';
    const dayInMillis = 24 * 60 * 60 * 1000;
    const minuteInMillis = 60 * 1000;
    let currentDate = startDate;

    while (currentDate < endDate) {
      // Generate uptime data for the day
      let isConnected = false;
      let dayStart = currentDate;
      let dayEnd = dayStart + dayInMillis;

      while (currentDate < dayEnd) {
        const uptimeTimestamp = new Date(currentDate);
        const metadataTimestamp = Math.floor(currentDate / 1000);

        isConnected = !isConnected;

        uptimeData.push({
          timestamp: uptimeTimestamp,
          metadata: {
            deviceId: deviceId,
            data: isConnected ? 'connected' : 'disconnected',
            timestamp: metadataTimestamp,
          },
        });

        currentDate += getRandomInt(1, 3) * 60 * 60 * 1000;
      }

      currentDate = dayStart;

      let lastTriggerTime = currentDate;

      while (lastTriggerTime < dayEnd && dayEnd - lastTriggerTime > 12 * 60 * 60 * 1000) {
        const analyticsTimestamp = new Date(lastTriggerTime);
        const metadataTimestamp = Math.floor(lastTriggerTime / 1000);

        analyticsData.push({
          timestamp: analyticsTimestamp,
          metadata: {
            deviceId: deviceId,
            data: getRandomInt(0, 1),
            timestamp: metadataTimestamp,
          },
        });

        lastTriggerTime += getRandomInt(1, 60) * minuteInMillis;
      }

      currentDate = dayEnd;
    }

    // Insert the generated data into the collections
    await db.collection('analyticsData').insertMany(analyticsData);
    await db.collection('uptimeData').insertMany(uptimeData);

    console.log('Data inserted into MongoDB time series collections.');
  } finally {
    await client.close();
  }
}

generateData().catch(console.dir);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


