#!/bin/bash

heroku pg:psql -a goodybag-staging-magic < "$( dirname "${BASH_SOURCE[0]}" )/drop-all-tables.sql"

heroku pgbackups:restore --app goodybag-staging-magic DATABASE_URL  `heroku pgbackups:url --app goodybag-production-magic`
