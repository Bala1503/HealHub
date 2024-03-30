import express from "express";
import { updateDoctor, deleteDoctor, getAllDoctor, getSingleDoctor, getDoctorProfile } from "../Controllers/doctorController.js";
import { authenicate, restrict } from "../auth/verifyToken.js";
import reviewRouter from "./review.js";

const router = express.Router()

// nested route
router.use('/:doctorId/reviews',reviewRouter)

router.get('/:id', getSingleDoctor)
router.get('/', getAllDoctor)
router.put('/:id', authenicate, restrict(['doctor']), updateDoctor)
router.delete('/:id', authenicate, restrict(['doctor']), deleteDoctor)
router.get('/profile/me', authenicate, restrict(['doctor']), getDoctorProfile) 

export default router;