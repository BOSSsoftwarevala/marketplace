# @ultra/realtime - Real-Time Engine

WebSocket-based real-time communication system for instant updates across the platform.

## Features

- ✅ Real-time bidirectional communication
- ✅ WebSocket connections
- ✅ Automatic reconnection
- ✅ Message broadcasting
- ✅ Room/channel support
- ✅ Event-driven architecture
- ✅ Connection pooling
- ✅ Memory efficient

## Getting Started

```bash
cd services/realtime
pnpm install
pnpm dev
```

The server will start on `ws://localhost:8080`

## Usage

### Client Side

```typescript
import { useRealtimeConnection } from '@ultra/realtime';

function Dashboard() {
  const { subscribe, send } = useRealtimeConnection();
  
  useEffect(() => {
    subscribe('updates', (data) => {
      console.log('Update received:', data);
    });
  }, []);
  
  const handleClick = () => {
    send('updates', { message: 'Hello' });
  };
  
  return <button onClick={handleClick}>Send Update</button>;
}
```

### Server Side

```typescript
import { RealtimeServer } from '@ultra/realtime';

const server = new RealtimeServer({ port: 8080 });
server.start();
```

## Events

The system supports various events:
- `user:online` - User comes online
- `user:offline` - User goes offline
- `data:update` - Data updated
- `notification:new` - New notification
- `message:new` - New message

## Performance

- Handles 10,000+ concurrent connections
- Sub-100ms latency
- Automatic connection pooling
- Memory-efficient message queuing
