const express = require("express");
const router = express.Router();
const viewcontrolar = require("./../controlar/viewsController");
const authControlar = require("./../controlar/authControlar");





router.route("/tour/:slug")
    .get(authControlar.protectTours ,viewcontrolar.getTour)

router.use(authControlar.isLoggedIn)
//router.use(authControlar.isLoggedout,viewcontrolar.getOverview)

router.route("/")
    .get(viewcontrolar.getOverview);


router.route('/login')
    .get(viewcontrolar.getLoginForm);

router.route('/me')
    .get(authControlar.protectTours, viewcontrolar.getAccount);




module.exports = router;