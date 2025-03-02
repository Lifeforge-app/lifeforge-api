import express, { Request, Response } from 'express'
import event from './routes/events.js'
import category from './routes/categories.js'

const router = express.Router()

router.use('/events', event)
router.use('/categories', category)

export default router
