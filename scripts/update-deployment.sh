#!/bin/bash
# ==============================================================================
# Script: update-deployment.sh
# Purpose: Pull latest Docker images, recreate client containers, and cleanup old images.
# ==============================================================================

set -e

CLIENT_DIR="$(pwd)"
CLIENT_NAME="$(basename "$CLIENT_DIR")"

# Define the target services to update (these must match the service names in docker-compose.yml)
TARGET_SERVICES="backend frontend"

# Explicit container names
backend_container_name="aipos-backend"
frontend_container_name="aipos-frontend"

echo "======================================================================"
echo "🚀 Updating Client: '$CLIENT_NAME' at $CLIENT_DIR"
echo "🎯 Target Services: $TARGET_SERVICES"
echo "======================================================================"

# 1. Pull latest Docker images from Docker Hub
echo "📥 [1/4] Pulling latest Docker Hub images..."
docker compose pull $TARGET_SERVICES

# 2. Recreate containers with updated images
echo "🐳 [2/4] Recreating containers with updated images..."
docker compose up -d --force-recreate $TARGET_SERVICES

# 3. Apply Prisma database migrations inside backend container
echo "🔄 [3/4] Running Prisma database migrations..."
sleep 3
# Run migration on the specifically named container
docker exec "$backend_container_name" npx prisma migrate deploy || true

# 4. Purge old/unused Docker images to free disk space
# Using -f instead of -af so we only delete untagged/dangling images,
# preserving other projects' cached images on the same VM.
echo "🧹 [4/4] Purging dangling Docker images..."
docker image prune -f

echo "======================================================================"
echo "✅ Success: Client '$CLIENT_NAME' containers updated & old images deleted!"
echo "======================================================================"
docker compose ps
