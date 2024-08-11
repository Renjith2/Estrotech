const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri);

async function getUptimeDataCollection() {
    await client.connect();
    const db = client.db('Internetofthings'); // Your database name
    return db.collection('uptimeData'); // Your collection name
}

const router = require('express').Router();

// Helper function to process uptime data
const getUptimeData = async () => {
    const Uptime = await getUptimeDataCollection();
    const uptimeRecords = await Uptime.find({}).sort({ timestamp: 1 }).toArray();

    if (uptimeRecords.length === 0) {
        return null; // No data found
    }

    const result = [];
    let previousRecord = null;

    uptimeRecords.forEach((record) => {

        const currentState = record.metadata?.data;

        if (previousRecord) {
            // Calculate duration in milliseconds
            const duration = record.timestamp - previousRecord.timestamp;

            result.push({
                timestamp: previousRecord.timestamp,
                state: previousRecord.state,
                duration: duration,
            });
        }

        previousRecord = {
            timestamp: record.timestamp,
            state: currentState,
        };
    });

    // Handle the last record separately
    if (previousRecord) {
        result.push({
            timestamp: previousRecord.timestamp,
            state: previousRecord.state,
            duration: 0, // No duration since it's the latest record
        });
    }

    return result;
};

// Route to get uptime data
const uptimereport= async (req, res) => {
/**
 * @swagger
 * /api/uptime/list:
 *   get:
 *     summary: Retrieve uptime data
 *     tags:
 *       - Uptime Data API
 *     responses:
 *       '200':
 *         description: Successfully retrieved the list of uptime data records.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               description: An array of uptime data records. The array can be very long, depending on the amount of data.
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: The timestamp of the record.
 *                     example: '2024-06-01T00:00:00.000Z'
 *                   state:
 *                     type: string
 *                     description: The state of the device (e.g., connected or disconnected).
 *                     example: 'connected'
 *                   duration:
 *                     type: integer
 *                     format: int64
 *                     description: The duration of the state in milliseconds.
 *                     example: 3600000
 *               example:
 *                 - timestamp: '2024-06-01T00:00:00.000Z'
 *                   state: 'connected'
 *                   duration: 3600000
 *                 - timestamp: '2024-06-01T01:00:00.000Z'
 *                   state: 'disconnected'
 *                   duration: 7200000
 *                 - timestamp: '2024-06-01T03:00:00.000Z'
 *                   state: 'connected'
 *                   duration: 10800000
 *                 - timestamp: '2024-06-01T06:00:00.000Z'
 *                   state: 'disconnected'
 *                   duration: 7200000
 *                 - timestamp: '2024-06-01T08:00:00.000Z'
 *                   state: 'connected'
 *                   duration: 7200000
 *                 - timestamp: '2024-06-01T10:00:00.000Z'
 *                   state: 'disconnected'
 *                   duration: 3600000
 *                 - ... # Indicates that there are more records in the full response
 *       '401':
 *         description: Unauthorized - Invalid token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   description: A message indicating the token is invalid.
 *                   example: 'Invalid Token'
 *       '404':
 *         description: No uptime data found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating no data was found.
 *                   example: 'No uptime data found'
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating an internal server error occurred.
 *                   example: 'Internal Server Error'
 */

    try {
        const data = await getUptimeData();
        if (data === null) {
            return res.status(404).json({ message: 'No uptime data found' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
uptimereport
}
