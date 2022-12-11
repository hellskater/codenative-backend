import express from 'express'

import { config } from 'dotenv'
import { initializeMiddlewares } from '@setup/middleware'

// Initialising dotenv to read .env file
config()

const main = async (): Promise<void> => {
  const app = express()
  const PORT = 1337

  // Initialising middlewares
  initializeMiddlewares(app)

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  })
}

main().catch(() => {
  console.log('Something went wrong!')
})
