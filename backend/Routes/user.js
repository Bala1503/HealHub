import express from "express";
import { updateUser, deleteUser, getAllUser, getSingleUser, getUserProfile, getMyAppointments } from "../Controllers/userController.js";
import { authenicate, restrict } from "../auth/verifyToken.js";

const router = express.Router()

router.get('/:id', authenicate, restrict(['patient']), getSingleUser)
router.get('/', authenicate, restrict(['admin']), getAllUser)
router.put('/:id', authenicate, restrict(['patient']), updateUser)
router.delete('/:id', authenicate, restrict(['patient']), deleteUser)
router.get('/profile/me', authenicate, restrict(['patient']), getUserProfile)
router.get('/appointments/my-appointments', authenicate, restrict(['patient']), getMyAppointments)

export default router;