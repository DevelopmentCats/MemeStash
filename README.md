# Meme Stash

A self-hostable Progressive Web App (PWA) for storing, organizing, and sharing memes.

## Technology Stack

- **Frontend**: Vue.js with PWA capabilities
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with JSONB support for flexible data storage
- **Containerization**: Docker and Docker Compose

## Project Structure

```
meme-stash/
├── frontend/             # Vue.js PWA frontend
├── backend/              # Node.js Express backend
├── docker/               # Additional Docker configurations
├── docker-compose.yml    # Production Docker Compose
└── docker-compose.dev.yml # Development Docker Compose
```

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) (v8 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Option 1: Running with Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd meme-stash
   ```

2. Start the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000

### Option 2: Running Locally

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd meme-stash/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run serve
   ```

4. Access the frontend at http://localhost:8080

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd meme-stash/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the API at http://localhost:3000

#### Database Setup

1. Install PostgreSQL locally or use Docker:
   ```bash
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_DB=memestash -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgres:15-alpine
   ```

2. Update the `.env` file with your database connection details.

## Production Deployment

1. Build and start the production environment:
   ```bash
   docker-compose up -d
   ```

2. Access the application at http://localhost

## Testing the "Hello World" Connection

1. Start both the frontend and backend servers using one of the methods above.
2. Navigate to the home page in your browser.
3. Click the "Test Backend Connection" button.
4. If successful, you should see a message from the backend: "Hello from Meme Stash Backend!"

## Features

- Store and organize memes
- Advanced tagging and search capabilities
- Offline access to your meme collection
- Cross-platform sharing features

## License

[MIT](LICENSE)