# Install Cloud SQL proxy for local development
curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64

# Make it executable
chmod +x cloud-sql-proxy

# Run the proxy
./cloud-sql-proxy [PROJECT_ID]:us-east1:freelance-db

# In another terminal, dump your Neon database
pg_dump \
  --host=ep-shiny-cloud-a5kqrx16.us-east-2.aws.neon.tech \
  --port=5432 \
  --username=neondb_owner \
  --dbname=neondb \
  > database_backup.sql

# Restore to Cloud SQL
psql \
  --host=localhost \
  --port=5432 \
  --username=freelance_user \
  --dbname=freelance_tracker \
  < database_backup.sql