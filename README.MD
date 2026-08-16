# Collaborative Dashboard

A multi-backend real-time task management application for learning and comparing Node.js, FastAPI, and Java APIs against a shared MongoDB database. An Express gateway provides one entry point for the frontend and routes requests by backend prefix.

## Architecture

```text
React frontend :3000
        |
        v
Express gateway :8080
  /api/node/*     -> backend-node :5000
  /api/fastapi/*  -> backend-fastapi :5001
  /api/java/*     -> backend-java :5002
  /api/csharp/*   -> backend-csharp :5003
        |
        v
MongoDB :27017
```

## Services

| Service | Port | Directory | Status |
| --- | ---: | --- | --- |
| Frontend | 3000 | `frontend/` | React/Vite |
| Gateway | 8080 | `gateway/` | Express path router |
| Node API | 5000 | `backend-node/` | Express, Mongoose, Socket.io |
| FastAPI | 5001 | `backend-fastapi/` | FastAPI, Motor, Pydantic |
| Java API | 5002 | `backend-java/` | Spring Boot, Spring Data MongoDB |
| C# API | 5003 | `backend-csharp/` | ASP.NET Core, MongoDB.Driver |
| MongoDB | 27017 | Docker volume | Shared database |

## Quick Start with Docker

### Prerequisites

- Docker Desktop with Docker Compose
- Git

### Start the stack

```powershell
Copy-Item .env.example .env
docker compose build
docker compose up
```

Run detached with:

```powershell
docker compose up -d
```

Stop the stack with:

```powershell
docker compose down
```

The main URLs are:

- Frontend: http://localhost:3000
- Gateway documentation: http://localhost:8080/
- Gateway health: http://localhost:8080/health
- Gateway status: http://localhost:8080/status
- Node health through gateway: http://localhost:8080/api/node/health
- FastAPI documentation: http://localhost:8080/api/fastapi/docs

The Java service is a Spring Boot application packaged with Maven and built into a Java 17 runtime image.

## Gateway Routing

The gateway uses the first path segment after `/api` to select a backend:

| Request prefix | Target |
| --- | --- |
| `/api/node` | Node API on port 5000 |
| `/api/fastapi` | FastAPI on port 5001 |
| `/api/java` | Java API on port 5002 |
| `/api/csharp` | C# API on port 5003 |

Examples:

```text
GET http://localhost:8080/api/node/boards
GET http://localhost:8080/api/fastapi/boards
GET http://localhost:8080/api/node/tasks/board/<boardId>
GET http://localhost:8080/api/fastapi/tasks/board/<boardId>
```

The gateway removes the public backend prefix before forwarding. It then applies each backend's internal route prefix: Node receives `/api/...`, while FastAPI receives `/...`. Direct backend ports are useful for debugging, but frontend clients should use port `8080`.

## API Endpoints

All three backends expose the same read endpoints through the gateway.

### Boards

| Method | Node path | FastAPI path | Description |
| --- | --- | --- | --- |
| GET | `/api/node/boards` | `/api/fastapi/boards` | Get all boards |
| GET | `/api/node/boards/user/:userId` | `/api/fastapi/boards/user/:userId` | Get boards owned by or shared with a user |

### Tasks

| Method | Node path | FastAPI path | Description |
| --- | --- | --- | --- |
| GET | `/api/node/tasks/board/:boardId` | `/api/fastapi/tasks/board/:boardId` | Get a board's tasks sorted by column and position |

### Java Backend

The Java service exposes the same routes through the gateway:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/java/health` | Java service health |
| GET | `/api/java/boards` | Get all boards |
| GET | `/api/java/boards/user/:userId` | Get boards owned by or shared with a user |
| GET | `/api/java/tasks/board/:boardId` | Get a board's tasks sorted by column and position |

### C# Backend

The ASP.NET Core service exposes the same routes through the gateway:

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/csharp/health` | C# service health |
| GET | `/api/csharp/boards` | Get all boards |
| GET | `/api/csharp/boards/user/:userId` | Get boards owned by or shared with a user |
| GET | `/api/csharp/tasks/board/:boardId` | Get a board's tasks sorted by column and position |

Successful list responses use this shape:

```json
{
  "success": true,
  "data": [],
  "count": 0
}
```

## Node.js WebSocket Events

The Node backend provides the current Socket.io implementation:

- `join_board`: join a board room
- `leave_board`: leave a board room
- `task_moved`: broadcast a task movement
- `task_updated`: emitted to other clients in the board room

## Local Development Without Docker

Start MongoDB locally first, then run each service in its own terminal.

### Node API

```powershell
cd backend-node
npm install
npm run dev
```

Build and test it with:

```powershell
npm run build
npm test
```

### FastAPI

```powershell
cd backend-fastapi
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 5001
```

### Java API

The Java service requires Java 17 and Maven 3.9 or later when running outside Docker. The project uses Spring Boot 3.3 and Spring Data MongoDB.

```powershell
cd backend-java
mvn test
mvn spring-boot:run
```

The direct Java service runs on http://localhost:5002. Its MongoDB connection is read from `MONGODB_URI`, which should point to the local MongoDB instance when running outside Docker.

### Gateway

```powershell
cd gateway
npm install
npm run dev
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

## Testing in Docker

```powershell
docker compose exec backend-node npm test
docker compose exec backend-fastapi pytest
```

The Node test suite currently contains 23 passing tests covering board and task controllers and routes. The Java suite contains 5 MockMvc tests covering health, board, task, and bad-request responses. The FastAPI suite covers 6 endpoint and validation cases using an in-memory async database stub.

Java controller tests use MockMvc and cover health, board, task, and bad-request responses:

```powershell
cd backend-java
mvn test
```

### C# API Tests

The C# test project uses xUnit, Moq, and ASP.NET TestHost. It covers health, board, task, empty-result, and service-parameter behavior:

```powershell
cd backend-csharp
dotnet test .\Tests\CollaborativeDashboard.Api.Tests.csproj
```

The C# Docker build runs these tests before publishing the production image.

## Environment Variables

Copy `.env.example` to `.env`. Important values include:

```env
NODE_ENV=development
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=password
MONGO_DB_NAME=collaborative-dashboard
GATEWAY_PORT=8080
PORT=5000
VITE_API_URL=http://localhost:8080
```

The Docker Compose file supplies service-to-service hostnames such as `backend-node`, `backend-fastapi`, `mongodb`, and `java-backend`. Do not use `localhost` for those hostnames from inside a container.

For local Java development, set the MongoDB connection explicitly if needed:

```powershell
$env:MONGODB_URI = "mongodb://admin:password@localhost:27017/collaborative-dashboard?authSource=admin"
```

## Project Structure

```text
collaborative-dashboard/
├── gateway/          # Express API gateway
├── backend-node/     # Node.js API and Socket.io service
├── backend-fastapi/  # FastAPI API service
├── backend-java/     # Spring Boot API service
├── backend-csharp/   # ASP.NET Core API service
├── frontend/         # React/Vite application
├── shared-types/     # Shared TypeScript model definitions
├── docker-compose.yml
├── .env.example
└── README.MD
```

## Current Status

- Node.js board and task read endpoints: implemented and tested
- FastAPI board and task read endpoints: implemented
- Express gateway: implemented and Docker-built successfully
- Docker Compose: configured for the full stack
- Java backend: Spring Boot read endpoints implemented and Docker-integrated
- Node, Java, and C# tests: implemented and passing
- C# test suite: 7 tests passing
- FastAPI tests: implemented and passing
- Authentication, write endpoints, and Mongo seed data: planned

## License

ISC
