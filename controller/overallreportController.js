
const express = require('express');
const router = express.Router();

const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function getAnalyticsDataCollection() {
    await client.connect();
    const db = client.db('Internetofthings');
    return db.collection('analyticsData');
}

async function getUptimeDataCollection() {
    await client.connect();
    const db = client.db('Internetofthings');
    return db.collection('uptimeData');
}





const getOverallReport = async (startDate, endDate) => {
    const Analytics = await getAnalyticsDataCollection();
    const Uptime = await getUptimeDataCollection();

    // Get the minimum and maximum dates from the analytics data
    const minMaxAnalytics = await Analytics.aggregate([
        { $group: { _id: null, minDate: { $min: "$timestamp" }, maxDate: { $max: "$timestamp" } } }
    ]).toArray();

    if (minMaxAnalytics.length === 0) {
        return {
            success: false,
            message: 'No analytical data found in the database.'
        };
    }

    const validStartDate = new Date(minMaxAnalytics[0].minDate);
    const validEndDate = new Date(minMaxAnalytics[0].maxDate);

   

    // Validate date range against the valid range
    if (startDate < validStartDate || endDate > validEndDate) {
        return {
            success: false,
            message: `Date range should be between ${validStartDate.toISOString().split('T')[0]} and ${validEndDate.toISOString().split('T')[0]}.`
        };
    }

    // Fetch and process analytical data
    const analyticalData = await Analytics.find({ timestamp: { $gte: startDate, $lte: endDate } }).toArray();
    const totalAnalyticalData = analyticalData.reduce((sum, record) => sum + record.metadata.data, 0);
    const averageAnalyticalData = analyticalData.length ? totalAnalyticalData / analyticalData.length : 0;

    // Group by day and calculate busiest and quietest days
    const dataByDay = {};
    analyticalData.forEach(record => {
        const day = new Date(record.timestamp).toISOString().split('T')[0];
        dataByDay[day] = (dataByDay[day] || 0) + record.metadata.data;
    });

    const sortedDays = Object.keys(dataByDay).sort((a, b) => dataByDay[b] - dataByDay[a]);
    const busiestDays = sortedDays.slice(0, 3).map(day => ({ date: day, dataGenerated: dataByDay[day] }));
    const quietestDays = sortedDays.slice(-3).map(day => ({ date: day, dataGenerated: dataByDay[day] }));

    // Fetch uptime data
    const uptimeData = await Uptime.find({ timestamp: { $gte: startDate, $lte: endDate } }).sort({ timestamp: 1 }).toArray();
    
    let totalUptime = 0;
    let totalDowntime = 0;

    // Initial state before the first record
    let previousTimestamp = startDate.getTime();
    let previousState = uptimeData.length > 0 ? uptimeData[0].metadata.data : 'disconnected'; // Assuming 'disconnected' is the default

    for (const record of uptimeData) {
        const currentTimestamp = record.timestamp;
        const currentState = record.metadata?.data;

        // Calculate the duration between previous and current record
        const duration = currentTimestamp - previousTimestamp;

        // Accumulate uptime or downtime based on the state
        if (previousState === 'connected') {
            totalUptime += duration;
        } else {
            totalDowntime += duration;
        }

        // Update previous state and timestamp for the next iteration
        previousTimestamp = currentTimestamp;
        previousState = currentState;
    }

    // Account for the period after the last record up to endDate
    const finalDuration = endDate.getTime() - previousTimestamp;
    if (previousState === 'connected') {
        totalUptime += finalDuration;
    } else {
        totalDowntime += finalDuration;
    }

    return {
        success: true,
        totalAnalyticalData,
        averageAnalyticalData,
        busiestDays,
        quietestDays,
        totalUptime: {
            hours: Math.floor(totalUptime / 3600000),
            minutes: Math.floor((totalUptime % 3600000) / 60000),
            seconds: Math.floor((totalUptime % 60000) / 1000)
        },
        totalDowntime: {
            hours: Math.floor(totalDowntime / 3600000),
            minutes: Math.floor((totalDowntime % 3600000) / 60000),
            seconds: Math.floor((totalDowntime % 60000) / 1000)
        }
    };
};


const overallreportController= async (req, res) => {

    /**
 * @swagger
 * /api/overall-report/list:
 *   get:
 *     summary: Retrieve an overall report of analytical and uptime data for a specific date range.
 *     tags:
 *       - Overall Report API
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-07-01"
 *         description: The start date for the report in YYYY-MM-DD format.
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-07-10"
 *         description: The end date for the report in YYYY-MM-DD format.
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication.
 *         schema:
 *           type: string
 *           example: "Bearer <your-token-here>"
 *     responses:
 *       '200':
 *         description: Successfully retrieved the overall report for the specified date range.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalAnalyticalData:
 *                   type: integer
 *                   description: The total amount of analytical data generated in the specified date range.
 *                   example: 99
 *                 averageAnalyticalData:
 *                   type: number
 *                   format: float
 *                   description: The average amount of analytical data generated per record in the specified date range.
 *                   example: 0.45
 *                 busiestDays:
 *                   type: array
 *                   description: The three busiest days with the highest amount of data generated.
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the busy day.
 *                         example: "2024-07-06"
 *                       dataGenerated:
 *                         type: integer
 *                         description: The amount of data generated on that day.
 *                         example: 15
 *                   example:
 *                     - date: "2024-07-06"
 *                       dataGenerated: 15
 *                     - date: "2024-07-09"
 *                       dataGenerated: 14
 *                     - date: "2024-07-04"
 *                       dataGenerated: 13
 *                 quietestDays:
 *                   type: array
 *                   description: The three quietest days with the least amount of data generated.
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: The date of the quiet day.
 *                         example: "2024-07-07"
 *                       dataGenerated:
 *                         type: integer
 *                         description: The amount of data generated on that day.
 *                         example: 8
 *                   example:
 *                     - date: "2024-07-07"
 *                       dataGenerated: 8
 *                     - date: "2024-07-08"
 *                       dataGenerated: 8
 *                     - date: "2024-07-10"
 *                       dataGenerated: 0
 *                 totalUptime:
 *                   type: object
 *                   properties:
 *                     hours:
 *                       type: integer
 *                       description: The total number of hours of uptime.
 *                       example: 113
 *                     minutes:
 *                       type: integer
 *                       description: The total number of minutes of uptime.
 *                       example: 0
 *                     seconds:
 *                       type: integer
 *                       description: The total number of seconds of uptime.
 *                       example: 0
 *                 totalDowntime:
 *                   type: object
 *                   properties:
 *                     hours:
 *                       type: integer
 *                       description: The total number of hours of downtime.
 *                       example: 103
 *                     minutes:
 *                       type: integer
 *                       description: The total number of minutes of downtime.
 *                       example: 0
 *                     seconds:
 *                       type: integer
 *                       description: The total number of seconds of downtime.
 *                       example: 0
 *       '400':
 *         description: Bad Request - Invalid date format or date range.
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
 *                   example: 'Invalid date format. Please provide valid startDate and endDate in the format YYYY-MM-DD.'
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
 *                   example: 'Invalid Token'
 *       '404':
 *         description: No data found within the specified date range.
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
 *                   example: 'No analytical data found in the specified date range.'
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
 *                   example: 'Internal Server Error'
 */

    const { startDate, endDate } = req.query;

    try {
        // Convert query parameters to Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate that startDate and endDate are valid dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).send({
                success: false,
                message: 'Invalid date format. Please provide valid startDate and endDate in the format YYYY-MM-DD.'
            });
        }

        // Ensure startDate is not after endDate
        if (start > end) {
            return res.status(400).send({
                success: false,
                message: 'Invalid date range. startDate should not be after endDate.'
            });
        }

        const report = await getOverallReport(start, end);

        // Handle case where date range is outside valid range
        if (!report.success) {
            return res.status(400).send(report);
        }

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports={
    overallreportController
}