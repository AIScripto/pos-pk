#!/bin/sh
set -e

# Auto-generate JWT_SECRET at startup if not baked into the image
export JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"

# Apply already-created Prisma migrations. This is safe for production deploys
# and does not create new migration files inside the container.
npx prisma migrate deploy

# Seed base data after migrations. Run production user seeding script in production
# to prevent dev mock data from being injected into clean client databases.
if [ "$NODE_ENV" = "production" ]; then
  node dist/scripts/seedUsers.js || true
else
  node dist/seed.js || true
fi

# Replace the shell process with Node so container signals reach the API cleanly.
exec node dist/index.js
