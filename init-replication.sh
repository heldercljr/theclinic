#!/bin/bash
# init-replication.sh
# Initialize replication user and replication slots on primary server

set -e

echo "Initializing PostgreSQL replication on primary server..."

# Wait for PostgreSQL to be ready
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "Creating replication user and slots..."

# Create replication user with proper privileges
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create replication user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
            CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '$POSTGRES_REPLICATION_PASSWORD';
            GRANT CONNECT ON DATABASE $POSTGRES_DB TO replicator;
            GRANT USAGE ON SCHEMA public TO replicator;
            GRANT SELECT ON ALL TABLES IN SCHEMA public TO replicator;
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO replicator;
        END IF;
    END
    \$\$;

    -- Create replication slots for replicas
    SELECT CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_1_slot') 
        THEN pg_create_physical_replication_slot('replica_1_slot')
    END;
    
    SELECT CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica_2_slot') 
        THEN pg_create_physical_replication_slot('replica_2_slot')
    END;
EOSQL

echo "Creating test table for replication demo..."

# Create a test table for demonstration
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE TABLE IF NOT EXISTS replication_test (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Insert initial test data
    INSERT INTO replication_test (message) 
    VALUES ('Replication setup complete - Primary initialized!'),
           ('Test data for replication verification');
           
    -- Create an index for better performance
    CREATE INDEX IF NOT EXISTS idx_replication_test_created_at ON replication_test(created_at);
EOSQL

echo "Primary database replication setup completed successfully!"
echo "Available replication slots:"
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT slot_name, slot_type, active FROM pg_replication_slots;"