import * as express from 'express'
import { Request, Response } from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'

class ResetController implements IControllerBase {
    public path = '/'
    public router = express.Router()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.post('/', this.index)
    }

    index = (req: Request, res: Response) => {

        console.log(req.body.user_id)

        const msg = {
            msg: "Password Reset Successfully"
        }

        res.json(msg)

    }
}

export default ResetController