import express from 'express'

import { IpController } from '@api/controllers/ip.controller'

const router = express.Router()

router.post('/get', IpController.issueIp)
router.post('/destroy', IpController.destroyIp)

export default router
