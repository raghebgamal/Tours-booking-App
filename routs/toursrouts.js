const express = require("express");
const router = express.Router();
const controlar = require("./../controlar/tourscontrolar");
const authControlar = require("./../controlar/authControlar");
const reviewcontroller = require("./../controlar/reviewControlar");
const reviewrouts = require("./reviewsrouts");

//////////////////////////////////////

//router.param("id", controlar.checkId);

////////////////////////////////////////
router.use("/:tourId/reviews", reviewrouts);
router.route("/monthtours/:year")
    .get( authControlar.protectTours,
    authControlar.restrictUser("admin","lead-guide","guide"), controlar.numTourOfMonth);
router.route("/stats")
    .get(controlar.toursStats);
router.route("/theTopFive")
    .get(controlar.theTopFiveCheap, controlar.getAllTours)
router.route("/tour-within/:distance/center/:latlong/unit/:unit").get(controlar.getTourWithin);
router.route("/distances/:latlong/unit/:unit").get(controlar.getDistances);

router.route("/")
    .get(controlar.getAllTours)
    .post(authControlar.protectTours,authControlar.restrictUser("admin","lead-guide"), controlar.postTours);
router.route("/:id")
    .get(controlar.getOneTour)
    .patch( authControlar.protectTours,
        authControlar.restrictUser("admin", "lead-guide")
        , controlar.uploudeTourImages,
        controlar.resizeTourImages,
        controlar.updateTours)
    .delete(
    authControlar.protectTours,
    authControlar.restrictUser("admin","lead-guide"),
    controlar.deleteTours);
/*
router.route("/:tourId/reviews").post(
    authControlar.protectTours,
    authControlar.restrictUser("user"),
    reviewcontroller.createReview);    
*/
//////////////////////////////

module.exports = router;
