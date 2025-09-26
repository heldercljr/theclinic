#!/bin/bash
# test-replication.sh
# Comprehensive script to test PostgreSQL replication setup

set -e

# Load environment variables if .env file exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing PostgreSQL Replication Cluster${NC}"
echo -e "${BLUE}=======================================${NC}\n"

# Test function with colored output
test_step() {
    echo -e "${YELLOW}$1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Database connection details (from environment or defaults)
DB_USER="${POSTGRES_USER:-myuser}"
DB_NAME="${POSTGRES_DB:-mydatabase}"
DB_PASSWORD="${POSTGRES_PASSWORD:-mypassword}"

PRIMARY_HOST="localhost"
PRIMARY_PORT="${POSTGRES_PORT:-5432}"
REPLICA1_HOST="localhost"
REPLICA1_PORT="${POSTGRES_REPLICA_1_PORT:-5433}"
REPLICA2_HOST="localhost"
REPLICA2_PORT="${POSTGRES_REPLICA_2_PORT:-5434}"
HAPROXY_WRITE_PORT="${HAPROXY_PORT:-5000}"
HAPROXY_READ_PORT="${HAPROXY_READ_PORT:-5001}"

# Function to run SQL command
run_sql() {
    local host=$1
    local port=$2
    local query=$3
    PGPASSWORD=$DB_PASSWORD psql -h $host -p $port -U $DB_USER -d $DB_NAME -t -c "$query" 2>/dev/null
}

# Test 1: Check primary database connection
test_step "1. Testing primary database connection..."
if result=$(run_sql $PRIMARY_HOST $PRIMARY_PORT "SELECT 'Primary database connected successfully!' as status;"); then
    success "Primary database connection working"
else
    error "Cannot connect to primary database"
fi

# Test 2: Check replication user and slots
test_step "2. Checking replication setup on primary..."
replication_slots=$(run_sql $PRIMARY_HOST $PRIMARY_PORT "SELECT slot_name FROM pg_replication_slots;")
if [[ $replication_slots == *"replica"* ]]; then
    success "Replication slots configured"
    echo "Available slots: $(echo $replication_slots | tr '\n' ' ')"
else
    error "No replication slots found"
fi

# Test 3: Insert test data
test_step "3. Inserting test data into primary..."
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
if run_sql $PRIMARY_HOST $PRIMARY_PORT "INSERT INTO replication_test (message) VALUES ('Test insert at $timestamp');" > /dev/null; then
    success "Test data inserted successfully"
else
    error "Failed to insert test data"
fi

# Wait for replication
echo "Waiting 5 seconds for replication to sync..."
sleep 5

# Test 4: Check replica 1 connection and data
test_step "4. Testing replica 1 connection and data synchronization..."
if replica1_count=$(run_sql $REPLICA1_HOST $REPLICA1_PORT "SELECT COUNT(*) FROM replication_test;" | xargs); then
    success "Replica 1 connected successfully - Records: $replica1_count"
else
    error "Cannot connect to replica 1 or query failed"
fi

# Test 5: Check replica 2 connection and data
test_step "5. Testing replica 2 connection and data synchronization..."
if replica2_count=$(run_sql $REPLICA2_HOST $REPLICA2_PORT "SELECT COUNT(*) FROM replication_test;" | xargs); then
    success "Replica 2 connected successfully - Records: $replica2_count"
else
    error "Cannot connect to replica 2 or query failed"
fi

# Test 6: Verify data consistency
test_step "6. Verifying data consistency across all databases..."
primary_count=$(run_sql $PRIMARY_HOST $PRIMARY_PORT "SELECT COUNT(*) FROM replication_test;" | xargs)

if [ "$primary_count" = "$replica1_count" ] && [ "$primary_count" = "$replica2_count" ]; then
    success "Data is consistent across all databases ($primary_count records each)"
else
    error "Data inconsistency detected: Primary($primary_count), Replica1($replica1_count), Replica2($replica2_count)"
fi

# Test 7: Check replication status
test_step "7. Checking replication status on primary..."
replication_status=$(run_sql $PRIMARY_HOST $PRIMARY_PORT "SELECT application_name, client_addr, state, sync_state FROM pg_stat_replication;")
if [[ ! -z "$replication_status" ]]; then
    success "Replication is active"
    echo "Replication status:"
    echo "$replication_status"
else
    error "No active replication connections found"
fi

# Test 8: Test HAProxy write endpoint
test_step "8. Testing HAProxy write endpoint (port $HAPROXY_WRITE_PORT)..."
if run_sql "localhost" $HAPROXY_WRITE_PORT "INSERT INTO replication_test (message) VALUES ('Test via HAProxy write endpoint at $(date)');" > /dev/null; then
    success "HAProxy write endpoint working"
else
    error "HAProxy write endpoint failed"
fi

# Test 9: Test HAProxy read endpoint
test_step "9. Testing HAProxy read endpoint (port $HAPROXY_READ_PORT)..."
if latest_messages=$(run_sql "localhost" $HAPROXY_READ_PORT "SELECT message FROM replication_test ORDER BY created_at DESC LIMIT 3;"); then
    success "HAProxy read endpoint working"
    echo "Latest messages:"
    echo "$latest_messages"
else
    error "HAProxy read endpoint failed"
fi

# Test 10: Test read-write split
test_step "10. Testing read-write split functionality..."
# Insert via write endpoint
write_test_msg="Write-split test at $(date '+%H:%M:%S')"
run_sql "localhost" $HAPROXY_WRITE_PORT "INSERT INTO replication_test (message) VALUES ('$write_test_msg');" > /dev/null

# Wait for replication
sleep 3

# Read via read endpoint
if read_result=$(run_sql "localhost" $HAPROXY_READ_PORT "SELECT message FROM replication_test WHERE message LIKE '%Write-split test%' ORDER BY created_at DESC LIMIT 1;" | xargs); then
    if [[ "$read_result" == *"Write-split test"* ]]; then
        success "Read-write split working correctly"
    else
        error "Read-write split test failed - data not replicated"
    fi
else
    error "Failed to test read-write split"
fi

# Final summary
echo -e "\n${BLUE}Test Summary${NC}"
echo -e "${BLUE}============${NC}"
success "All replication tests passed!"
echo ""
echo -e "${YELLOW}Connection Information:${NC}"
echo "• Primary (read/write): localhost:$PRIMARY_PORT"
echo "• Replica 1 (read-only): localhost:$REPLICA1_PORT"  
echo "• Replica 2 (read-only): localhost:$REPLICA2_PORT"
echo "• HAProxy write endpoint: localhost:$HAPROXY_WRITE_PORT"
echo "• HAProxy read endpoint: localhost:$HAPROXY_READ_PORT"
echo "• HAProxy stats: http://localhost:8404/stats"

echo -e "\n${GREEN}Your PostgreSQL replication cluster is working correctly!${NC}"