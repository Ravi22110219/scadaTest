/**
 * AWS Lambda Function: updateScadaData
 * Runtime: Node.js 22.x
 * 
 * Purpose: Updates or creates SCADA data in DynamoDB
 * API: PUT /data/{id}
 * 
 * Request Body:
 * {
 *   "data": {
 *     "pumpStatus": "ON",
 *     "tankLevel": 72,
 *     "pressure": 1.5,
 *     "temperature": 25.3,
 *     "flowRate": 120.5
 *   }
 * }
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          error: "Missing required path parameter: id"
        })
      };
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || "{}");
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          error: "Invalid JSON in request body"
        })
      };
    }

    // Validate data field exists
    if (!requestBody.data || typeof requestBody.data !== "object") {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          error: "Missing or invalid 'data' field in request body"
        })
      };
    }

    // Generate timestamp
    const timestamp = Date.now();

    // Prepare item for DynamoDB
    const item = {
      id: id,
      data: requestBody.data,
      timestamp: timestamp
    };

    // Put item in DynamoDB
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });

    await docClient.send(command);

    console.log("Data updated successfully:", item);

    // Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        message: "Data updated successfully",
        id: id,
        timestamp: timestamp
      })
    };

  } catch (error) {
    console.error("Error updating data:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message
      })
    };
  }
};
