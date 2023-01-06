import express from 'express'

import exampleRoutes from '@api/routes/example'

const router = express.Router()

router.use('/example', exampleRoutes)

export default router
