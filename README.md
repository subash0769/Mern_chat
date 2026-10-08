StreamLine — MERN Real-Time Chat Application

A modern, full-stack, real-time messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO.

The application uses a three-tier architecture with separate containers for the MongoDB database, Node.js/Express backend, and React/Vite frontend.

⸻

🏗️ Architecture Overview

The application is structured into three decoupled tiers:

mern-chat/
├── server/       # Node.js + Express API + Socket.IO Server
├── client/       # React + Vite Single Page Application
├── compose.yaml  # Docker Compose configuration
└── README.md     # Setup and containerization reference

Application Architecture

                    Browser
                       │
                       │ :5173
                       ▼
              ┌─────────────────┐
              │     Client      │
              │ React + Vite    │
              │   Node.js 22    │
              └────────┬────────┘
                       │
                       │ :5010
                       ▼
              ┌─────────────────┐
              │     Server      │
              │ Express +       │
              │ Socket.IO       │
              │   Node.js 20    │
              └────────┬────────┘
                       │
                       │ mongo:27017
                       ▼
              ┌─────────────────┐
              │     MongoDB     │
              │     mongo:7     │
              └─────────────────┘

1. Database Tier: MongoDB

MongoDB stores the application’s persistent data.

* Image: mongo:7
* Container port: 27017
* Host port: 27017
* Database: chatapp
* Persistent volume: mongo-data

Collections

* channels: Stores communication rooms (name, description, createdAt).
* messages: Stores room conversations (channel, sender, avatar, content, createdAt).
* users: Tracks online profiles, avatars, and presence status (username, avatar, status).

2. Backend Tier: Express + Socket.IO

Located in:

server/

The backend provides the REST API and real-time Socket.IO communication.

* Node.js: 20 Alpine
* Container port: 5010
* Host port: 5010
* Dockerfile: server/DockerFile

REST Endpoints

* GET /api/health — Health check endpoint.
* GET /api/channels — List all chat channels.
* POST /api/channels — Create a new channel.
* GET /api/messages/:channelId — Retrieve chat history for a channel.
* POST /api/messages/:channelId — Fallback REST endpoint for posting messages.
* POST /api/users/login — Join/login user session.
* GET /api/users — List active user directory.

WebSocket Events

* user_online: Register user presence across active connections.
* join_channel / leave_channel: Socket room partitioning for isolated channel messaging.
* send_message: Stores message to MongoDB and broadcasts new_message to the room.
* typing / stop_typing: Real-time user typing indicators.

3. Frontend Tier: React + Vite

Located in:

client/

The frontend provides the application’s user interface and communicates with the backend through REST APIs and Socket.IO.

* Node.js: 22 Alpine
* Container port: 5173
* Host port: 5173
* Dockerfile: client/DockerFile

Features

* Dark mode workspace UI inspired by Slack/Discord.
* Instant channel creation and channel switching.
* Real-time message streaming without page refreshes.
* Typing indicators.
* Active user presence sidebar.
* DiceBear dynamic avatar generation for usernames.

⸻

🚀 Running Locally Without Docker

Prerequisites

* Node.js v18+ and npm
* MongoDB running locally or through Docker

1. Start MongoDB

You can run MongoDB using:

docker run -d \
  -p 27017:27017 \
  --name mongodb \
  mongo:7

2. Backend Setup

cd mern-chat/server
npm install
cp .env.example .env

Optionally seed the database:

npm run seed

Start the backend:

npm run dev

The backend runs on:

http://localhost:5010

3. Frontend Setup

Open another terminal:

cd mern-chat/client
npm install
cp .env.example .env
npm run dev

Open the application at:

http://localhost:5173

⸻

🐳 Docker Setup

The application can be run using Docker Compose with three services:

mongo
server
client

The project uses two custom Dockerfiles and one official Docker image:

Service	Image / Build	Port
mongo	mongo:7	27017
server	server/DockerFile	5010
client	client/DockerFile	5173

MongoDB does not require a custom Dockerfile because the official mongo:7 image is used directly.

⸻

📁 Docker Project Structure

mern-chat/
├── server/
│   ├── DockerFile
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── client/
│   ├── DockerFile
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── compose.yaml
└── README.md

⸻

🐳 Dockerfiles

Backend Dockerfile

The backend uses Node.js 20 Alpine.

FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/. .
EXPOSE 5000
CMD ["node", "server.js"]

Frontend Dockerfile

The frontend uses Node.js 22 Alpine and Vite.

FROM node:22-alpine
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/. .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

The --host option allows Vite to accept connections from outside the container.

⸻

⚙️ Docker Compose Configuration

The application is orchestrated using Docker Compose.

services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
  server:
    build:
      context: .
      dockerfile: server/DockerFile
    ports:
      - "5010:5010"
    depends_on:
      - mongo
    environment:
      - PORT=5010
      - MONGO_URI=mongodb://mongo:27017/chatapp
      - CLIENT_ORIGIN=http://localhost:5173
  client:
    build:
      context: .
      dockerfile: client/DockerFile
    ports:
      - "5173:5173"
    depends_on:
      - server
    environment:
      - VITE_API_URL=http://localhost:5010
volumes:
  mongo-data:
    driver: local

⸻

🔐 Environment Variables

Service	Variable	Docker Value
Server	PORT	5010
Server	MONGO_URI	mongodb://mongo:27017/chatapp
Server	CLIENT_ORIGIN	http://localhost:5173
Client	VITE_API_URL	http://localhost:5010

Why MONGO_URI uses mongo

Inside Docker Compose, the MongoDB service is named:

mongo

Therefore, the backend connects to MongoDB using:

mongodb://mongo:27017/chatapp

rather than:

mongodb://localhost:27017/chatapp

localhost inside the server container refers to the server container itself, not the MongoDB container.

Why VITE_API_URL uses localhost

The React application ultimately runs in the user’s browser. Therefore, the browser accesses the backend through the host’s published port:

http://localhost:5010

⸻

▶️ Running with Docker Compose

From the project root:

docker compose up --build

The --build option rebuilds the client and server images before starting the containers.

Once the containers are running, open:

http://localhost:5173

Run in detached mode

To run the application in the background:

docker compose up --build -d

Check running containers

docker compose ps

View logs

All services:

docker compose logs

Server only:

docker compose logs server

Client only:

docker compose logs client

MongoDB only:

docker compose logs mongo

Stop the application

docker compose down

The MongoDB data remains stored in the named mongo-data volume.

To remove the containers and the MongoDB volume:

docker compose down -v

Warning: removing the volume deletes the persisted MongoDB data.

⸻

🔗 Port Mapping

The Docker Compose setup exposes the following ports:

Host                 Container
──────────────────────────────────
localhost:5173   →   client:5173
localhost:5010   →   server:5010
localhost:27017  →   mongo:27017

The main application is available at:

http://localhost:5173

The backend health endpoint is available at:

http://localhost:5010/api/health

⸻

🧱 Container Architecture

Docker Compose creates and manages the application’s services:

                    Docker Compose
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      ┌────────┐    ┌─────────┐    ┌─────────┐
      │ client │    │ server  │    │  mongo  │
      │        │    │         │    │         │
      │ Node 22│    │ Node 20 │    │ Mongo 7 │
      │ React  │    │ Express │    │         │
      │ Vite   │    │ Socket.IO│   │         │
      └────────┘    └────┬────┘    └────┬────┘
           │             │              │
         :5173         :5010          :27017
                         │
                         └──────────────┘

The application follows this communication flow:

Browser
   │
   ▼
React/Vite Client
   │
   │ HTTP / Socket.IO
   ▼
Express + Socket.IO Server
   │
   │ MongoDB connection
   ▼
MongoDB

⸻

📌 Docker Concepts Demonstrated

This project is also designed as a practical Docker learning project. It demonstrates:

* Creating custom Dockerfiles.
* Using different Node.js base images.
* Building images from a project root using Docker build contexts.
* Running multiple application containers.
* Using an official MongoDB image.
* Docker Compose service orchestration.
* Container-to-container communication.
* Environment variables.
* Port mapping.
* depends_on.
* Named Docker volumes.
* Persistent database storage.
* React/Vite containerization.
* Node.js/Express containerization.
* Separating frontend, backend, and database services.# Mern_chat
