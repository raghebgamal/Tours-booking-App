const express = require("express");
const router = express.Router();
const bookingcontrolar = require("./../controlar/bookingController");
const authControlar = require("./../controlar/authControlar");

router.get("/checkout-session/:tourId",authControlar.protectTours,bookingcontrolar.getCheckoutSession)


module.exports = router;
