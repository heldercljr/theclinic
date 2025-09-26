#!/bin/bash
# setup-replica.sh
# Set up PostgreSQL replica server with streaming replication

set -e

echo "Setting up PostgreSQL replica server..."

# Determine replica slot name based on hostname/container name
REPLICA_SLOT="replica_1_slot"
if [[ "$HOSTNAME" == *"replica-2"* ]]; then
    REPLICA_SLOT="replica_2_slot"
fi

echo "Using replication slot: $REPLICA_SLOT"

# Wait for primary database to be ready
echo "Waiting for primary database to be available..."
until PGPASSWORD=$POSTGRES_REPLICATION_PASSWORD pg_isready -h $POSTGRES_PRIMARY_HOST -p $POSTGRES_PRIMARY_PORT -U replicator; do
  echo "Primary database not ready, waiting..."
  sleep 3
done

echo "Primary database is ready!"

# Check if data directory is empty or needs to be recreated
if [ -d "/var/lib/postgresql/data" ] && [ "$(ls -A /var/lib/postgresql/data 2>/dev/null)" ]; then
    # Check if this is already a replica by looking for standby.signal
    if [ ! -f "/var/lib/postgresql/data/standby.signal" ]; then
        echo "Data directory exists but not configured as replica. Clearing..."
        rm -rf /var/lib/postgresql/data/*
    else
        echo "Replica already configured. Checking if primary connection is working..."
        # Try to start normally if already configured
        exec docker-entrypoint.sh postgres -c config_file=/etc/postgresql/postgresql.conf
    fi
fi

# Ensure data directory exists and has correct permissions
mkdir -p /var/lib/postgresql/data
chown postgres:postgres /var/lib/postgresql/data
chmod 700 /var/lib/postgresql/data

# Create base backup from primary
echo "Creating base backup from primary server..."
cd /var/lib/postgresql

# Use pg_basebackup to clone the primary
PGPASSWORD=$POSTGRES_REPLICATION_PASSWORD pg_basebackup \
    -h $POSTGRES_PRIMARY_HOST \
    -p $POSTGRES_PRIMARY_PORT \
    -U replicator \
    -D /var/lib/postgresql/data \
    -Fp \
    -Xs \
    -v \
    -P \
    -R

echo "Base backup completed successfully!"

# Create standby.signal file (indicates this is a replica)
touch /var/lib/postgresql/data/standby.signal

# Create postgresql.auto.conf with replica-specific settings
cat > /var/lib/postgresql/data/postgresql.auto.conf <<EOF
# Replica configuration
primary_conninfo = 'host=$POSTGRES_PRIMARY_HOST port=$POSTGRES_PRIMARY_PORT user=replicator password=$POSTGRES_REPLICATION_PASSWORD application_name=${HOSTNAME}_replica'
primary_slot_name = '$REPLICA_SLOT'
restore_command = ''
archive_cleanup_command = ''
recovery_target_timeline = 'latest'
EOF

# Set correct ownership and permissions
chown -R postgres:postgres /var/lib/postgresql/data
find /var/lib/postgresql/data -type d -exec chmod 700 {} \;
find /var/lib/postgresql/data -type f -exec chmod 600 {} \;

echo "Replica configuration completed!"
echo "Starting PostgreSQL replica server..."

# Start PostgreSQL as replica
exec docker-entrypoint.sh postgres -c config_file=/etc/postgresql/postgresql.conf