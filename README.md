# SCADA Monitoring System

A professional real-time SCADA (Supervisory Control and Data Acquisition) monitoring system with 6 React-based displays powered by AWS serverless infrastructure.

## System Architecture

### Frontend
- **1 Controller Display**: Manual data input interface for updating SCADA parameters
- **5 Viewer Displays**: Real-time monitoring displays that poll data every 5 seconds
- Built with Next.js 15, React 19, TypeScript, and Tailwind CSS

### Backend
- **AWS Lambda**: Two serverless functions (Node.js 22.x)
  - `updateScadaData`: Handles PUT requests to update data
  - `getScadaData`: Handles GET requests to retrieve data
- **API Gateway**: REST API with CORS enabled
- **DynamoDB**: NoSQL database for storing SCADA data

## Features

- Real-time data monitoring with 5-second polling
- Manual data input via controller interface
- Professional dark theme optimized for industrial environments
- Responsive design for desktop and mobile
- Connection status indicators
- Error handling and retry logic
- Type-safe API client
- No hardcoded data - all data flows through AWS backend

## Prerequisites

- Node.js 18+ installed
- AWS Account with appropriate permissions
- AWS CLI configured (optional, for CLI deployment)

## Quick Start

### 1. AWS Backend Setup

Follow the complete guide in `AWS_SETUP_GUIDE.md` to:
1. Create DynamoDB table
2. Set up IAM roles and policies
3. Deploy Lambda functions
4. Configure API Gateway
5. Get your API endpoint URL

### 2. Frontend Setup

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local and add your API Gateway URL
# NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
# NEXT_PUBLIC_SCADA_ID=scada001
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open:
- Controller: http://localhost:3000/controller
- Viewer: http://localhost:3000/viewer

### 4. Deploy to Production

\`\`\`bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to any hosting platform that supports Next.js
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── controller/          # Controller display page
│   ├── viewer/              # Viewer display page
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Home page (redirects to controller)
│   └── globals.css          # Global styles and theme
├── components/
│   ├── controller-display.tsx  # Controller UI component
│   ├── viewer-display.tsx      # Viewer UI component
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── api.ts               # API client for backend communication
│   └── utils.ts             # Utility functions
├── lambda/
│   ├── updateScadaData.mjs  # Lambda function for PUT requests
│   ├── getScadaData.mjs     # Lambda function for GET requests
│   ├── package.json         # Lambda dependencies
│   └── README.md            # Lambda deployment guide
├── AWS_SETUP_GUIDE.md       # Complete AWS infrastructure setup
└── README.md                # This file
\`\`\`

## Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Required
NEXT_PUBLIC_API_URL=https://YOUR_API_ID.execute-api.REGION.amazonaws.com/prod
NEXT_PUBLIC_SCADA_ID=scada001

# Optional
NEXT_PUBLIC_POLL_INTERVAL=5000  # Polling interval in milliseconds (default: 5000)
\`\`\`

## API Endpoints

### PUT /data/{id}
Update SCADA data

**Request:**
\`\`\`json
{
  "data": {
    "pumpStatus": "ON",
    "tankLevel": 72,
    "pressure": 1.5,
    "temperature": 25.3,
    "flowRate": 120.5
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Data updated successfully",
  "id": "scada001",
  "timestamp": 1704067200000
}
\`\`\`

### GET /data/{id}
Retrieve SCADA data

**Response:**
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

## SCADA Parameters

| Parameter | Type | Unit | Description |
|-----------|------|------|-------------|
| pumpStatus | string | - | Pump operational status (ON, OFF, STANDBY, MAINTENANCE) |
| tankLevel | number | % | Tank fill level percentage (0-100) |
| pressure | number | bar | System pressure |
| temperature | number | °C | System temperature |
| flowRate | number | L/min | Liquid flow rate |

## Multiple Displays Setup

To run multiple viewer displays:

1. **Option 1: Multiple Browser Windows**
   - Open http://localhost:3000/viewer in multiple browser windows
   - Each window will independently poll the backend

2. **Option 2: Multiple Devices**
   - Deploy to production
   - Access the viewer URL from different devices
   - All devices will show synchronized data

3. **Option 3: Different SCADA IDs**
   - Create multiple DynamoDB entries with different IDs
   - Use URL parameters: `/viewer?id=scada002`
   - Modify the code to read ID from URL params

## Customization

### Change Polling Interval

Edit `.env.local`:
\`\`\`env
NEXT_PUBLIC_POLL_INTERVAL=3000  # Poll every 3 seconds
\`\`\`

### Add New Parameters

1. Update the `ScadaData` interface in `lib/api.ts`
2. Add input fields in `components/controller-display.tsx`
3. Add display cards in `components/viewer-display.tsx`
4. No backend changes needed - DynamoDB stores JSON flexibly

### Customize Theme

Edit `app/globals.css` to change colors:
\`\`\`css
--color-primary: 59 130 246;  /* Blue accent */
--color-chart-1: 59 130 246;  /* Chart color 1 */
\`\`\`

## Monitoring and Debugging

### Frontend Debugging

\`\`\`bash
# Check browser console for errors
# Network tab shows API requests/responses
\`\`\`

### Backend Debugging

\`\`\`bash
# View Lambda logs
aws logs tail /aws/lambda/updateScadaData --follow
aws logs tail /aws/lambda/getScadaData --follow

# Test Lambda directly
aws lambda invoke \
    --function-name getScadaData \
    --payload '{"pathParameters":{"id":"scada001"}}' \
    response.json
\`\`\`

### Common Issues

1. **CORS Errors**: Ensure API Gateway CORS is enabled
2. **404 Not Found**: Check API URL and SCADA ID
3. **Connection Failed**: Verify Lambda functions are deployed
4. **Data Not Updating**: Check DynamoDB table and IAM permissions

## Performance

- **Frontend**: Optimized React components with minimal re-renders
- **Backend**: Serverless architecture scales automatically
- **Database**: DynamoDB provides single-digit millisecond latency
- **Polling**: 5-second interval balances real-time updates with API costs

## Security

- CORS configured for cross-origin requests
- Input validation on both frontend and backend
- IAM roles follow least privilege principle
- Environment variables for sensitive configuration
- HTTPS enforced via API Gateway

## Production Recommendations

1. **Add Authentication**: Implement AWS Cognito or API keys
2. **Enable Monitoring**: Set up CloudWatch alarms
3. **Add Rate Limiting**: Configure API Gateway throttling
4. **Enable Backups**: Turn on DynamoDB point-in-time recovery
5. **Use CDN**: Deploy frontend to Vercel or CloudFront
6. **Add Logging**: Implement structured logging for debugging

## Cost Estimation

Monthly costs for 6 displays polling every 5 seconds:

- **DynamoDB**: ~$5-10 (storage + requests)
- **Lambda**: ~$2-5 (compute time)
- **API Gateway**: ~$10-15 (API requests)
- **Total**: ~$15-30/month

## License

MIT

## Support

For issues or questions:
1. Check `AWS_SETUP_GUIDE.md` for infrastructure setup
2. Check `lambda/README.md` for Lambda function details
3. Review CloudWatch logs for backend errors
4. Check browser console for frontend errors
