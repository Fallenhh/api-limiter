# api-limiter
a simple demo for api-limiter middlerware for express

## Prerequisite
- node > 12.16.2
- install [redis](https://redis.io/download) and start a local instance

## Install 
`npm i`

## Run
`npm run dev`

## Test
`curl -H "Content-Type: application/json" -X POST -d '{"user_id": "deadbeef", "password": "abadpassword" }' "http://localhost:5000"`
