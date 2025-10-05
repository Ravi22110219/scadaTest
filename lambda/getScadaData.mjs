/**
 * AWS Lambda Function: getScadaData
 * Runtime: Node.js 22.x
 * 
 * Purpose: Retrieves SCADA data from DynamoDB
 * API: GET /data/{id}
 * 
 * Response:
 * {
 *   "id": "scada001",
 *   "data": {
 *     "pumpStatus": "ON",
 *     "tankLevel": 72,
 *     "pressure": 1.5,
 *     "temperature": 25.3,
 *     "flowRate": 120.5
 *   },
 *   "timestamp": 1704067200000
 * }
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || "ScadaData";

/**
 * Lambda handler function
 */
export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  try {
    // Extract ID from path parameters
    const id = event.pathParameters?.id;
    
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          error: "Missing required path parameter: id"
        })
      };
    }

    // Get item from DynamoDB
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: id
      }
    });

    const response = await docClient.send(command);

    // Check if item exists
    if (!response.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          error: "Data not found",
          message: `No data found for id: ${id}`
        })
      };
    }

    console.log("Data retrieved successfully:", response.Item);

    // Return success response with data
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(response.Item)
    };

  } catch (error) {
    console.error("Error retrieving data:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message
      })
    };
  }
};
