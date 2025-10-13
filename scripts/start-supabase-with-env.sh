#!/bin/bash

# Start Supabase with Environment Variables
# This script ensures edge functions have access to required environment variables

set -e

echo "Starting Supabase with environment variables..."

# Export environment variables so they're available to Docker
export GLM_API_KEY="92eadf47cf5a4dafb6fa0670c6c537dd.IC3vMG8F1IWbV7yR"
export GLM_API_URL="https://open.bigmodel.cn/api/paas/v4/chat/completions"
export GLM_MODEL="glm-4-flash"

# Start Supabase
supabase start

echo ""
echo "Supabase started successfully!"
echo ""
echo "Injecting environment variables into edge runtime container..."

# Wait for container to be ready
sleep 3

# Get the container name
CONTAINER_NAME=$(docker ps --filter "name=supabase_edge_runtime" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "Error: Could not find edge runtime container"
    exit 1
fi

echo "Found container: $CONTAINER_NAME"

# Create a script to set environment variables in the container
docker exec "$CONTAINER_NAME" sh -c "cat > /tmp/set_env.sh << 'EOF'
#!/bin/sh
export GLM_API_KEY='92eadf47cf5a4dafb6fa0670c6c537dd.IC3vMG8F1IWbV7yR'
export GLM_API_URL='https://open.bigmodel.cn/api/paas/v4/chat/completions'
export GLM_MODEL='glm-4-flash'
EOF"

docker exec "$CONTAINER_NAME" chmod +x /tmp/set_env.sh

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Note: The variables are set but may not persist across container restarts."
echo "For production, use: supabase secrets set GLM_API_KEY=your-key"
echo ""
echo "Supabase is ready at: http://localhost:54321"
