# Docker Build & Push Guide

---

## Step 1: For Clients - Run Application

### Prerequisites
- Docker installed on machine
- Docker Compose installed

### Steps

1. **Download the project** and navigate to the folder:
   ```bash
   cd path/to/crip-crumbs
   ```

2. **Run the application**:
   ```bash
   docker-compose up -d
   ```

3. **Wait 1-2 minutes** for containers to start

4. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3500
   - Database: localhost:5432

5. **To stop**:
   ```bash
   docker-compose down
   ```

---

## Step 2: For Developer - Build & Push Images

### Option A: Using GitHub Actions (Recommended)

#### Step 1: Configure Secrets in GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_HUB_USERNAME` | your Docker Hub username |
| `DOCKER_HUB_TOKEN` | Docker Hub access token |
| `OPENAI_API_KEY` | your OpenAI API key |
| `STRIPE_SECRET_KEY` | your Stripe secret key |

#### Step 2: Trigger Build

**Automatic (on push):**
```bash
git add .
git commit -m "Update"
git push origin master # or main
```

**Manual:**
1. Go to GitHub → **Actions** tab
2. Click **Build and Push Docker Images**
3. Click **Run workflow** → **Run workflow**

#### Step 3: Verify Images

Check Docker Hub:
- Backend: https://hub.docker.com/r/tariqsulehri/aipos-be
- Frontend: https://hub.docker.com/r/tariqsulehri/aipos-fe

---

### Option B: Manual Build & Push

#### Step 1: Install Docker
Download from https://www.docker.com/products/docker-desktop

#### Step 2: Login to Docker Hub
```bash
docker login -u your-username
```

#### Step 3: Set Environment Variables
```bash
export OPENAI_API_KEY=your-openai-key
export STRIPE_SECRET_KEY=your-stripe-key
```

#### Step 4: Build Backend
```bash
cd backend

docker build \
  --build-arg OPENAI_API_KEY=${OPENAI_API_KEY} \
  --build-arg STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY} \
  -t tariqsulehri/aipos-be:latest \
  .
```

#### Step 5: Push Backend
```bash
docker push tariqsulehri/aipos-be:latest
```

#### Step 6: Build Frontend
```bash
cd ../frontend

docker build -t tariqsulehri/aipos-fe:latest .
```

#### Step 7: Push Frontend
```bash
docker push tariqsulehri/aipos-fe:latest
```

---

## Step 3: Deploy Updated Images on Server

### Steps

1. **SSH to your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Navigate to project folder**:
   ```bash
   cd path/to/crip-crumbs
   ```

3. **Pull latest images**:
   ```bash
   docker-compose pull
   ```

4. **Restart containers**:
   ```bash
   docker-compose up -d
   ```

5. **Check status**:
   ```bash
   docker-compose ps
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Containers won't start | Run `docker-compose logs` to see errors |
| Frontend not loading | Wait 1 minute, then refresh |
| Database connection error | Ensure PostgreSQL container is healthy |
| Image not found | Run `docker-compose pull` to fetch latest |

### Common Commands

```bash
# View all containers
docker ps

# View logs
docker logs <container-name>

# View all logs
docker-compose logs

# Restart a service
docker-compose restart backend

# Rebuild without cache
docker-compose build --no-cache

# Stop everything
docker-compose down

# Remove volumes too
docker-compose down -v
```