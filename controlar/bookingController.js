const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("./../models/toursModels");
const catchAsync = require("./../utility/catchAsync");
const Factory = require("./handellerFactory");
const AppError = require("../utility/appError");


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    
    const tour = await Tour.findById(req.params.tourId);




    const session = await stripe.checkout.sessions.create({
        line_items: [{
            price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100,
                product_data: {
                    name: tour.name,
                    description: tour.summary,
                    images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                },
            },
    
            quantity: 1,
        }],
       
        mode: 'payment',
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    });




    res.status(200).json({
        status: 'success',
        session
    });


});