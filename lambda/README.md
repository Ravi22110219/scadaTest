# Lambda Functions for SCADA Monitoring System

## Overview

This directory contains two AWS Lambda functions for the SCADA monitoring system:

1. **updateScadaData.mjs** - Handles PUT requests to update/create SCADA data
2. **getScadaData.mjs** - Handles GET requests to retrieve SCADA data

## Runtime

- **Node.js 22.x**
- Uses ES modules (`.mjs` extension)
- AWS SDK v3 for DynamoDB operations

## Dependencies

\`\`\`json
{
  "@aws-sdk/client-dynamodb": "^3.700.0",
  "@aws-sdk/lib-dynamodb": "^3.700.0"
}
\`\`\`

## Deployment

### Option 1: AWS Console (Recommended for beginners)

1. Navigate to AWS Lambda Console
2. Create function with Node.js 22.x runtime
3. Copy and paste the code from each `.mjs` file
4. Click "Deploy"

**Note**: AWS Lambda includes AWS SDK by default, so you don't need to upload dependencies when using the console.

### Option 2: AWS CLI with Deployment Package

If you need to include custom dependencies:

\`\`\`bash
# Install dependencies
cd lambda
npm install

# Create deployment package for updateScadaData
zip -r updateScadaData.zip updateScadaData.mjs node_modules/

# Deploy
aws lambda update-function-code \
    --function-name updateScadaData \
    --zip-file fileb://updateScadaData.zip

# Create deployment package for getScadaData
zip -r getScadaData.zip getScadaData.mjs node_modules/

# Deploy
aws lambda update-function-code \
    --function-name getScadaData \
    --zip-file fileb://getScadaData.zip
\`\`\`

### Option 3: Using Lambda Layers (For shared dependencies)

\`\`\`bash
# Create layer
mkdir -p layer/nodejs
cd layer/nodejs
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
cd ../..
zip -r layer.zip layer/

# Create Lambda layer
aws lambda publish-layer-version \
    --layer-name scada-dependencies \
    --zip-file fileb://layer.zip \
    --compatible-runtimes nodejs22.x

# Attach layer to functions
aws lambda update-function-configuration \
    --function-name updateScadaData \
    --layers arn:aws:lambda:REGION:ACCOUNT_ID:layer:scada-dependencies:1
\`\`\`

## Environment Variables

Both functions support the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `TABLE_NAME` | `ScadaData` | DynamoDB table name |
| `AWS_REGION` | `us-east-1` | AWS region |

Set these in Lambda Console under Configuration > Environment variables.

## IAM Permissions Required

The Lambda execution role needs:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/ScadaData"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
\`\`\`

## Testing

### Test updateScadaData

Create test event in Lambda Console:

\`\`\`json
{
  "pathParameters": {
    "id": "scada001"
  },
  "body": "{\"data\":{\"pumpStatus\":\"ON\",\"tankLevel\":72,\"pressure\":1.5,\"temperature\":25.3,\"flowRate\":120.5}}"
}
\`\`\`

Expected response:
\`\`\`json
{
  "statusCode": 200,
  "body": "{\"message\":\"Data updated successfully\",\"id\":\"scada001\",\"timestamp\":1704067200000}"
}
\`\`\`

### Test getScadaData

Create test event in Lambda Console:

\`\`\`json
{
  "pathParameters": {
    "id": "scada001"
  }
}
\`\`\`

Expected response:
\`\`\`json
{
  "statusCode": 200,
  "body": "{\"id\":\"scada001\",\"data\":{\"pumpStatus\":\"ON\",\"tankLevel\":72,\"pressure\":1.5,\"temperature\":25.3,\"flowRate\":120.5},\"timestamp\":1704067200000}"
}
\`\`\`

## Monitoring

### CloudWatch Logs

View logs in CloudWatch:
- Log group: `/aws/lambda/updateScadaData`
- Log group: `/aws/lambda/getScadaData`

### CloudWatch Metrics

Monitor:
- Invocations
- Errors
- Duration
- Throttles

## Error Handling

Both functions include comprehensive error handling:

- **400 Bad Request**: Missing parameters or invalid JSON
- **404 Not Found**: Data doesn't exist (GET only)
- **500 Internal Server Error**: DynamoDB errors or unexpected issues

All errors are logged to CloudWatch with full stack traces.

## Performance Optimization

### Current Configuration:
- **Memory**: 128 MB (default, sufficient for these operations)
- **Timeout**: 3 seconds (default, sufficient for DynamoDB operations)
- **Concurrency**: Unreserved (scales automatically)

### Recommendations:
- Monitor CloudWatch metrics for duration
- Increase memory if duration > 2 seconds consistently
- Set reserved concurrency if you need guaranteed capacity
- Enable X-Ray tracing for detailed performance analysis

## Security Best Practices

1. **Least Privilege**: IAM role only has required DynamoDB permissions
2. **CORS**: Configured for cross-origin requests
3. **Input Validation**: All inputs are validated before processing
4. **Error Messages**: Don't expose sensitive information in errors
5. **Logging**: Sensitive data is not logged

## Troubleshooting

### Common Issues:

1. **"Cannot find module '@aws-sdk/client-dynamodb'"**
   - Solution: AWS SDK v3 is included by default in Node.js 22.x runtime

2. **"User is not authorized to perform: dynamodb:PutItem"**
   - Solution: Check IAM role has correct permissions

3. **"Timeout after 3 seconds"**
   - Solution: Increase Lambda timeout or check DynamoDB performance

4. **"CORS error in browser"**
   - Solution: Verify API Gateway CORS is enabled and Lambda returns CORS headers

### Debug Commands:

\`\`\`bash
# View recent logs
aws logs tail /aws/lambda/updateScadaData --follow

# Invoke function directly
aws lambda invoke \
    --function-name updateScadaData \
    --payload file://test-event.json \
    response.json

# Check function configuration
aws lambda get-function-configuration \
    --function-name updateScadaData
\`\`\`

## Version History

- **v1.0.0** - Initial release with Node.js 22.x support
