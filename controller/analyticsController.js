

const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri);

async function getAnalyticsDataCollection() {
    await client.connect();
    const db = client.db('Internetofthings'); // Your database name
    return db.collection('analyticsData'); // Your collection name
}

const router = require('express').Router();

// Helper function to aggregate data
const getAggregatedData = async (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const Analytics = await getAnalyticsDataCollection();

    const aggregationResult = await Analytics.aggregate([
        {
            $match: {
                timestamp: { $gte: startOfDay, $lt: endOfDay }
            }
        },
        {
            $group: {
                _id: { hour: { $hour: "$timestamp" } },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.hour": 1 }
        }
    ]).toArray();

    if (aggregationResult.length === 0) {
        return null; // No data found for the given date
    }


    const databyhour = Array(24).fill(0);
    let totalDataCount = 0;
    let busiestHour = 0;
    let maxDataInHour = 0;

    aggregationResult.forEach(result => {
        const hour = result._id.hour;
        const count = result.count;
        databyhour[hour] = count;
        totalDataCount += count;

        if (count > maxDataInHour) {
            maxDataInHour = count;
            busiestHour = hour;
        }
    });

    const averageDataPerHour = totalDataCount / 24;

    return {
        databyhour,
        net: totalDataCount,
        avg: averageDataPerHour,
        busiesthour: busiestHour
    };
};

// Route to get analytical data


const analyticsController = async(req, res) => {
 
    /**
 * @swagger
 * /api/analytics/{date}:
 *   get:
 *     summary: Retrieve aggregated analytical data for a specific date.
 *     tags:
 *       - Analytical Data API
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-06-05"
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *           example: "Bearer <your-token-here>"
 *     responses:
 *       '200':
 *         description: Successfully retrieved the aggregated data for the specified date.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 databyhour:
 *                   type: array
 *                   description: An array with 24 elements representing the data count for each hour of the day.
 *                   items:
 *                     type: integer
 *                   example: [3, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
 *                 net:
 *                   type: integer
 *                   description: The total data count for the day.
 *                   example: 21
 *                 avg:
 *                   type: number
 *                   format: float
 *                   description: The average data count per hour.
 *                   example: 0.875
 *                 busiesthour:
 *                   type: integer
 *                   description: The hour with the highest data count.
 *                   example: 0
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
 *                   example: Invalid Token
 *       '404':
 *         description: No data found for the given date.
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
 *                   example: Given date is invalid or no data found for the specified date
 *       '500':
 *         description: Internal Server Error.
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
 *                   example: Internal Server Error
 */


    try {
        const date = req.params.date;
        const data = await getAggregatedData(date);
        if (data === null) {
            return res.status(404).json({ message: 'Given date is invalid or no data found for the specified date' });
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    analyticsController,
}




