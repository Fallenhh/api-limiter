import { Request, Response } from 'express'
import * as moment from 'moment'
import * as redis from 'redis'

// should do this in a config file
const redisClient = redis.createClient();
const WINDOW_SIZE_IN_MINS = 1;
const MAX_WINDOW_REQUEST_COUNT = 5;
const WINDOW_LOG_INTERVAL_IN_MINS = 1;


const limiterMiddleware = (req: Request, resp: Response, next) => {
    try {
        if (!redisClient) {
          throw new Error('Redis client does not exist!');
          process.exit(1);
        }
        
        // seperator '|' should be banned in a userid, or could use user_token
        // key example deadbeef|GET|/
        let key = req.body.user_id + '|' + req.method + '|' +req.path;

        redisClient.get(key, function(err, record) {
          if (err) throw err;
          const currentRequestTime = moment();

          // record example [{\"requestTimeStamp\":1594110334,\"requestCount\":5}]
          console.log(record);
          
          // a new request
          if (record == null) {
            let newRecord = [];
            let requestLog = {
              requestTimeStamp: currentRequestTime.unix(),
              requestCount: 1
            };
            newRecord.push(requestLog);
            redisClient.set(key, JSON.stringify(newRecord));
            next();
          } else {
            let data = JSON.parse(record);
            let windowStartTimestamp = moment()
              .subtract(WINDOW_SIZE_IN_MINS, 'minutes')
              .unix();
            let requestsWithinWindow = data.filter(entry => {
              return entry.requestTimeStamp > windowStartTimestamp;
            });
            console.log('requestsWithinWindow', requestsWithinWindow);
            let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
              return accumulator + entry.requestCount;
            }, 0);
  
            if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
              resp
                .status(429)
                .send(
                    {
                        error: `Exceeded the ${MAX_WINDOW_REQUEST_COUNT} requests in ${WINDOW_SIZE_IN_MINS} hrs limit!`,
                    }
                );
            } else {
  
              let lastRequestLog = data[data.length - 1];
              let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
                .subtract(WINDOW_LOG_INTERVAL_IN_MINS, 'minutes')
                .unix();
  
              if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
                lastRequestLog.requestCount++;
                data[data.length - 1] = lastRequestLog;
              } else {
                  
                data.push({
                  requestTimeStamp: currentRequestTime.unix(),
                  requestCount: 1
                });
              }
              redisClient.set(key, JSON.stringify(data));
              next();
            }
          }

          
        });
      } catch (error) {
        next(error);
      }
}

export default limiterMiddleware