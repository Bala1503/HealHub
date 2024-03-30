import express from 'express'
import {authenicate} from './../auth/verifyToken.js'
import { getCheckoutSession } from '../Controllers/bookingController.js'

const router = express.Router()

router.post('/checkout-session/:doctorId',authenicate,getCheckoutSession)

export default router;