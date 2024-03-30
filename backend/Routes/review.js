import express from "express"
import { getAllReviews,createReview } from "../Controllers/reviewController.js"
import {authenicate,restrict} from "./../auth/verifyToken.js";

const router =express.Router({mergeParams:true})

router.route('/').get(getAllReviews).post(authenicate,restrict(['patient']),createReview)

export default router;