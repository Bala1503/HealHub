import express from "express";
import Stripe from "stripe";
import rawBody from "raw-body";
import Booking from "../models/BookingSchema.js";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import nodemailer from "nodemailer";

const router = express.Router();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "myportfoliobot@gmail.com", // your email address
    pass: "mxtf xgyl qbfx kehf" // your email password
  }
});

router.use((req, res, next) => {
  if (req.originalUrl === '/checkout-success/:id') {
    // Parse raw body only for the webhook endpoint
    rawBody(req, {
      length: req.headers['content-length'],
      encoding: 'utf8'
    }, (err, string) => {
      if (err) {
        return next(err);
      }
      // Store the raw body in req.rawBody
      req.rawBody = string;
      next();
    });
  } else {
    next();
  }
});

router.post('/:id', async(req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  const endpointSecret = 'whsec_FnKD3fEh1sRJ3Vqrkff59oppgFJ8lmwC';
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log(event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      const payment_status = event.data.object.payment_status;
      try {
        const doctor = await Doctor.findById(event.data.object.metadata.doctor_id);
        const user = await User.findById(event.data.object.metadata.user_id);
        if (payment_status === 'paid') {
          const booking = new Booking({
            doctor: doctor._id,
            user: user._id,
            ticketPrice: doctor.ticketPrice,
            session: event.id
          });
          await booking.save();

          // Send email containing booking details
          const today = new Date().toDateString();
          const mailOptions = {
            from: "myportfoliobot@gmail.com", // sender address
            to: event.data.object.customer_email, // list of receivers
            subject: "Booking Details", // Subject line
            html: `
                <html>
                <head>
                    <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .container {
                        padding: 20px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        background-color: #f9f9f9;
                    }
                    .header {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .content {
                        margin-bottom: 10px;
                    }
                    .footer {
                        font-style: italic;
                        color: #888;
                    }
                    </style>
                </head>
                <body>
                    <div class="container">
                    <div class="header">Hello ${user.name},</div>
                    <div class="content">
                        <p>Payment Successful</p>
                        <p>Your booking details:</p>
                        <img src=${doctor.photo} alt="Doctor photo"/>
                        <p><strong>Doctor:</strong> ${doctor.name}</p>
                        <p><strong>Specialization:</strong> ${doctor.specialization}</p>
                        <p><strong>Address:</strong> ${doctor.address}</p>
                        <p><strong>Ticket Price:</strong> ${doctor.ticketPrice}</p>
                        <p><strong>Date:</strong> ${today}</p>
                    </div>
                    <div class="footer">Thank you for booking with us!</div>
                    </div>
                </body>
                </html>
            `
          };
          transporter.sendMail(mailOptions, function(err, info){
            if (err) {
              console.error('Error sending email:', err);
            } else {
              console.log('Email sent:', info.response);
            }
          });
        }
        res.json({received:true});
      } catch (err) {
        res.status(500).json({success:false,message:'Error inserting booking'});
      }
      break;
    default:
      console.log('Unhandled event type:', event.type);
      res.json({received:true});
  }
});



export default router;
