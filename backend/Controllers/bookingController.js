import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Stripe from 'stripe'

export const getCheckoutSession = async(req,res)=>{
    try {
        const doctor = await Doctor.findById(req.params.doctorId)
        const user = await User.findById(req.userId)

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

        const session = await stripe.checkout.sessions.create({
            payment_method_types:['card'],
            mode:'payment',
            success_url:`${process.env.CLIENT_SITE_URL}/checkout-success/${doctor.id}`,
            cancel_url:`${process.env.CLIENT_SITE_URL}/doctors/${doctor.id}`,
            client_reference_id:req.params.doctorId,
            customer_email:user?.email,
            line_items:[
                {
                    price_data:{
                        currency:'inr',
                        unit_amount:doctor.ticketPrice * 100,
                        product_data:{
                            name:doctor.name,
                            description:doctor.bio,
                            images:[doctor.photo],
                        }
                    },
                    quantity:1
                }
            ],
            billing_address_collection:'required',
            metadata: {
                doctor_id: doctor.id,
                user_id:user.id, // Attach doctor's email address as metadata
            }
        })

        

        res.status(200).json({success:true,message:'Successfully Paid',session})

    } catch (err) {
        console.log(err);
        res.status(500).json({success:false,message:'Error creating checkout session'})
    }
}
