import App from './app'

import * as bodyParser from 'body-parser'
import loggerMiddleware from './middleware/logger'
import limiterMiddleware from './middleware/limiter'

import ResetController from './controllers/reset.controller'

const app = new App({
    port: 5000,
    controllers: [
        new ResetController(),
    ],
    middleWares: [
        bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        loggerMiddleware,
        limiterMiddleware,
    ]
})

app.listen()