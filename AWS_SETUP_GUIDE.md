# AWS Infrastructure Setup Guide for SCADA Monitoring System

## Overview
This guide provides complete step-by-step instructions for setting up the AWS backend infrastructure for the SCADA monitoring system using DynamoDB, Lambda, and API Gateway.

## Prerequisites
- AWS Account with administrative access
- AWS CLI installed and configured
- Node.js 22.x installed locally for testing

---

## Step 1: Create DynamoDB Table

### 1.1 Via AWS Console

1. Navigate to **DynamoDB** in AWS Console
2. Click **Create table**
3. Configure the table:
   - **Table name**: `ScadaData`
   - **Partition key**: `id` (String)
   - **Table settings**: Use default settings or customize as needed
4. Click **Create table**

### 1.2 Via AWS CLI

\`\`\`bash
aws dynamodb create-table \
    --table-name ScadaData \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
\`\`\`

### Table Schema
\`\`\`
{
  "id": "scada001",           // Primary Key (String)
  "data": {                   // JSON object containing SCADA parameters
    "pumpStatus": "ON",
    "tankLevel": 72,
    "pressure": 1.5,
    "temperature": 25.3,
    "flowRate": 120.5
  },
  "timestamp": 1704067200000  // Unix timestamp (Number)
}
\`\`\`

---

## Step 2: Create IAM Role for Lambda Functions

### 2.1 Create IAM Policy for DynamoDB Access

1. Navigate to **IAM** > **Policies** > **Create policy**
2. Select **JSON** tab and paste:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/ScadaData"
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

3. Name the policy: `ScadaLambdaDynamoDBPolicy`
4. Click **Create policy**

**Note**: Replace `YOUR_ACCOUNT_ID` with your actual AWS account ID.

### 2.2 Create IAM Role

1. Navigate to **IAM** > **Roles** > **Create role**
2. Select **AWS service** > **Lambda**
3. Attach the following policies:
   - `ScadaLambdaDynamoDBPolicy` (created above)
   - `AWSLambdaBasicExecutionRole` (AWS managed)
4. Name the role: `ScadaLambdaExecutionRole`
5. Click **Create role**

### 2.3 Via AWS CLI

Create policy:
\`\`\`bash
aws iam create-policy \
    --policy-name ScadaLambdaDynamoDBPolicy \
    --policy-document file://dynamodb-policy.json
\`\`\`

Create role:
\`\`\`bash
aws iam create-role \
    --role-name ScadaLambdaExecutionRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {"Service": "lambda.amazonaws.com"},
        "Action": "sts:AssumeRole"
      }]
    }'
\`\`\`

Attach policies:
\`\`\`bash
aws iam attach-role-policy \
    --role-name ScadaLambdaExecutionRole \
    --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/ScadaLambdaDynamoDBPolicy

aws iam attach-role-policy \
    --role-name ScadaLambdaExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
\`\`\`

---

## Step 3: Create Lambda Functions

### 3.1 Create updateScadaData Lambda Function

1. Navigate to **Lambda** > **Create function**
2. Configure:
   - **Function name**: `updateScadaData`
   - **Runtime**: Node.js 22.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role > `ScadaLambdaExecutionRole`
3. Click **Create function**
4. Copy the code from `lambda/updateScadaData.mjs` into the code editor
5. Click **Deploy**

### 3.2 Create getScadaData Lambda Function

1. Navigate to **Lambda** > **Create function**
2. Configure:
   - **Function name**: `getScadaData`
   - **Runtime**: Node.js 22.x
   - **Architecture**: x86_64
   - **Execution role**: Use existing role > `ScadaLambdaExecutionRole`
3. Click **Create function**
4. Copy the code from `lambda/getScadaData.mjs` into the code editor
5. Click **Deploy**

### 3.3 Configure Environment Variables (Optional)

For both Lambda functions, you can add environment variables:
- Key: `TABLE_NAME`, Value: `ScadaData`
- Key: `REGION`, Value: `us-east-1`

### 3.4 Via AWS CLI

Create updateScadaData:
\`\`\`bash
zip updateScadaData.zip lambda/updateScadaData.mjs

aws lambda create-function \
    --function-name updateScadaData \
    --runtime nodejs22.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ScadaLambdaExecutionRole \
    --handler updateScadaData.handler \
    --zip-file fileb://updateScadaData.zip \
    --region us-east-1
\`\`\`

Create getScadaData:
\`\`\`bash
zip getScadaData.zip lambda/getScadaData.mjs

aws lambda create-function \
    --function-name getScadaData \
    --runtime nodejs22.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ScadaLambdaExecutionRole \
    --handler getScadaData.handler \
    --zip-file fileb://getScadaData.zip \
    --region us-east-1
\`\`\`

---

## Step 4: Create API Gateway

### 4.1 Create REST API

1. Navigate to **API Gateway** > **Create API**
2. Select **REST API** (not private)
3. Click **Build**
4. Configure:
   - **API name**: `ScadaAPI`
   - **Endpoint Type**: Regional
5. Click **Create API**

### 4.2 Create /data Resource

1. Click **Actions** > **Create Resource**
2. Configure:
   - **Resource Name**: `data`
   - **Resource Path**: `/data`
   - Enable **CORS**
3. Click **Create Resource**

### 4.3 Create /{id} Resource

1. Select `/data` resource
2. Click **Actions** > **Create Resource**
3. Configure:
   - **Resource Name**: `id`
   - **Resource Path**: `{id}`
   - Enable **CORS**
4. Click **Create Resource**

### 4.4 Create PUT Method for /data/{id}

1. Select `/data/{id}` resource
2. Click **Actions** > **Create Method** > **PUT**
3. Configure:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✓ (checked)
   - **Lambda Function**: `updateScadaData`
   - **Use Default Timeout**: ✓ (checked)
4. Click **Save**
5. Grant API Gateway permission to invoke Lambda

### 4.5 Create GET Method for /data/{id}

1. Select `/data/{id}` resource
2. Click **Actions** > **Create Method** > **GET**
3. Configure:
   - **Integration type**: Lambda Function
   - **Use Lambda Proxy integration**: ✓ (checked)
   - **Lambda Function**: `getScadaData`
   - **Use Default Timeout**: ✓ (checked)
4. Click **Save**
5. Grant API Gateway permission to invoke Lambda

### 4.6 Enable CORS

For both GET and PUT methods:
1. Select the method
2. Click **Actions** > **Enable CORS**
3. Use default settings
4. Click **Enable CORS and replace existing CORS headers**

### 4.7 Deploy API

1. Click **Actions** > **Deploy API**
2. Configure:
   - **Deployment stage**: [New Stage]
   - **Stage name**: `prod`
3. Click **Deploy**
4. **Copy the Invoke URL** - you'll need this for the frontend

Example: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`

---

## Step 5: Test the API

### 5.1 Test PUT Request (Update Data)

\`\`\`bash
curl -X PUT https://YOUR_API_URL/prod/data/scada001 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "pumpStatus": "ON",
      "tankLevel": 72,
      "pressure": 1.5,
      "temperature": 25.3,
      "flowRate": 120.5
    }
  }'
\`\`\`

Expected Response:
\`\`\`json
{
  "message": "Data updated successfully",
  "id": "scada001",
  "timestamp": 1704067200000
}
\`\`\`

### 5.2 Test GET Request (Retrieve Data)

\`\`\`bash
curl https://YOUR_API_URL/prod/data/scada001
\`\`\`

Expected Response:
\`\`\`json
{
  "id": "scada001",
  "data": {
    "pumpStatus": "ON",
    "tankLevel": 72,
    "pressure": 1.5,
    "temperature": 25.3,
    "flowRate": 120.5
  },
  "timestamp": 1704067200000
}
\`\`\`

---

## Step 6: Configure Frontend

1. Copy your API Gateway Invoke URL
2. Update the frontend `.env.local` file:

\`\`\`env
NEXT_PUBLIC_API_URL=https://YOUR_API_URL/prod
NEXT_PUBLIC_SCADA_ID=scada001
\`\`\`

---

## Security Considerations

### Production Recommendations:

1. **API Authentication**: Add API keys or AWS Cognito authentication
2. **Rate Limiting**: Configure API Gateway throttling
3. **VPC**: Place Lambda functions in VPC if accessing private resources
4. **Encryption**: Enable encryption at rest for DynamoDB
5. **CloudWatch**: Set up alarms for errors and throttling
6. **Backup**: Enable point-in-time recovery for DynamoDB

### Add API Key (Optional):

1. In API Gateway, go to **API Keys** > **Create API Key**
2. Create a usage plan and associate it with your API stage
3. Require API key for methods
4. Update frontend to include `x-api-key` header

---

## Monitoring and Logging

### CloudWatch Logs

Lambda logs are automatically sent to CloudWatch:
- Log group: `/aws/lambda/updateScadaData`
- Log group: `/aws/lambda/getScadaData`

### CloudWatch Metrics

Monitor:
- Lambda invocations, errors, duration
- API Gateway 4XX/5XX errors, latency
- DynamoDB read/write capacity

---

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Ensure CORS is enabled on API Gateway methods
2. **403 Forbidden**: Check IAM role has correct DynamoDB permissions
3. **500 Internal Server Error**: Check Lambda CloudWatch logs
4. **Timeout**: Increase Lambda timeout (default 3s, max 15min)
5. **Table Not Found**: Verify table name and region match

### Debug Lambda Functions:

\`\`\`bash
# View logs
aws logs tail /aws/lambda/updateScadaData --follow

# Test Lambda directly
aws lambda invoke \
    --function-name getScadaData \
    --payload '{"pathParameters":{"id":"scada001"}}' \
    response.json
\`\`\`

---

## Cost Estimation

### Monthly Costs (Approximate):

- **DynamoDB**: $0.25 per GB stored + $1.25 per million write requests
- **Lambda**: First 1M requests free, then $0.20 per 1M requests
- **API Gateway**: $3.50 per million requests
- **Data Transfer**: $0.09 per GB out

**Example**: 6 displays polling every 5 seconds = ~155,520 requests/day
- Monthly: ~4.7M requests
- Estimated cost: ~$15-20/month

---

## Cleanup (Delete Resources)

To remove all resources:

\`\`\`bash
# Delete API Gateway
aws apigateway delete-rest-api --rest-api-id YOUR_API_ID

# Delete Lambda functions
aws lambda delete-function --function-name updateScadaData
aws lambda delete-function --function-name getScadaData

# Delete DynamoDB table
aws dynamodb delete-table --table-name ScadaData

# Delete IAM role and policy
aws iam detach-role-policy --role-name ScadaLambdaExecutionRole --policy-arn POLICY_ARN
aws iam delete-role --role-name ScadaLambdaExecutionRole
aws iam delete-policy --policy-arn POLICY_ARN
\`\`\`

---

## Support

For issues or questions:
- Check CloudWatch Logs for Lambda errors
- Review API Gateway execution logs
- Verify IAM permissions
- Test Lambda functions independently before API Gateway integration
