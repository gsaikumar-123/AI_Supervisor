# AI Supervisor Backend

Express.js REST API for the AI Supervisor system.

## Features
- RESTful API for call handling, request management, and knowledge base
- Firebase Firestore / LowDB storage backends
- LiveKit integration for real-time communication
- Server-Sent Events for real-time notifications
- Webhook support for external integrations
- Automatic timeout handling for stale requests

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_WS_URL=wss://your-livekit-host
SUPERVISOR_WEBHOOK_URL=http://localhost:3000/webhooks/supervisor
CALLER_WEBHOOK_URL=http://localhost:3000/webhooks/caller
USE_FIREBASE_REQUESTS=false
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
REQ_TIMEOUT_MS=600000
```

## Running

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

Test webhooks:
```bash
npm run test-webhooks
```

## API Endpoints

### Call Management
- `POST /api/call` - Handle incoming call
  ```json
  {
    "callerId": "caller_123",
    "question": "what are your opening hours?"
  }
  ```

### Request Management
- `GET /api/requests?status=pending` - List requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests/:id/answer` - Submit answer
  ```json
  {
    "answerText": "We are open 9am-7pm",
    "resolved": true
  }
  ```

### Knowledge Base
- `GET /api/kb` - All answers
- `GET /api/kb/learned` - Learned answers only

### Notifications
- `GET /api/stream/:callerId` - SSE stream
- `GET /api/notifications/:callerId` - Notification history

### LiveKit
- `GET /api/token?identity=user&room=aiAgent` - Get access token
- `GET /api/livekit-config` - Get WebSocket URL

### Health
- `GET /health` - Server health check

## Architecture

### Services
- `aiAgent.js` - Core AI logic and KB lookup
- `storage.js` - Request storage abstraction (LowDB/Firebase)
- `notify.js` - SSE notification management
- `kb.js` - Knowledge base operations
- `db.js` - LowDB initialization

### Routes
- `call.js` - Call handling endpoints
- `requests.js` - Request management endpoints
- `token.js` - LiveKit token generation
- `notify.js` - Notification endpoints
- `kb.js` - Knowledge base endpoints
- `webhooks.js` - Webhook receivers

### Data Models

**Request:**
```javascript
{
  id: string,
  callerId: string,
  question: string,
  status: 'pending' | 'resolved' | 'unresolved',
  createdAt: ISO8601,
  resolvedAt: ISO8601,
  answer: string
}
```

**KB Entry:**
```javascript
{
  question: string,
  answer: string,
  learnedAt: ISO8601
}
```

## Storage Backends

### LowDB (Default)
- File-based JSON storage
- Perfect for development and small deployments
- Data stored in `src/data/*.json`

### Firebase Firestore
- Cloud-based NoSQL database
- Scalable to millions of requests
- Set `USE_FIREBASE_REQUESTS=true` and provide Firebase credentials

## Webhook Integration

The system can POST to external webhooks:

**Supervisor Webhook (on escalation):**
```json
{
  "alert": "new_request",
  "requestId": "abc123",
  "question": "...",
  "callerId": "...",
  "message": "Hey, I need help answering: ..."
}
```

**Caller Webhook (on answer):**
```json
{
  "callerId": "caller_123",
  "requestId": "abc123",
  "question": "...",
  "answer": "..."
}
```

## Timeout Handling

Background process runs every 5 minutes:
- Marks requests pending > `REQ_TIMEOUT_MS` as unresolved
- Sends notifications to callers
- Prevents stuck requests

## Development

### Add New Route
1. Create file in `src/routes/`
2. Mount in `src/server.js`
3. Use services for business logic

### Add New Service
1. Create file in `src/services/`
2. Export functions
3. Use in routes

### Switch Storage Backend
Toggle `USE_FIREBASE_REQUESTS` in `.env`

## Production Deployment

1. Set environment variables
2. Run `npm install --production`
3. Start with `npm start`
4. Use process manager (PM2, systemd)
5. Set up reverse proxy (nginx)
6. Enable HTTPS

## License
ISC
