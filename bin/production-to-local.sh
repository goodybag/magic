#!/bin/bash

# Don't forget to run heroku pgbackups:capture --app goodybag-production-magic -e
# to create a new backup

# Download latest
curl -o latest.dump `heroku pgbackups:url --app goodybag-production-magic`

# Blow away goodybag db
psql -h localhost --command="drop database goodybag"
psql -h localhost --command="create database goodybag"


# Restore with production data
/Applications/Postgres.app/Contents/MacOS/bin/pg_restore --verbose --clean --no-acl --no-owner -h localhost -d goodybag latest.dump

# Clean up
rm latest.dump

echo "Restore Complete. Enjoy your data!"