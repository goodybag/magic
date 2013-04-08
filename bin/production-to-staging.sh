#!/bin/bash

heroku pgbackups:restore --app goodybag-staging-magic DATABASE_URL  `heroku pgbackups:url --app goodybag-production-magic`
