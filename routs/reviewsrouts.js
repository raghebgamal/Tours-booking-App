const express = require("express");
const router = express.Router({mergeParams:true});
const reviewcontrolar = require("./../controlar/reviewControlar");
const authControlar = require("./../controlar/authControlar");
router.use(authControlar.protectTours);
router.route("/")
    .get( reviewcontrolar.getAllReview)
    .post(authControlar.restrictUser("user") , reviewcontrolar.setTourAndUserIds, reviewcontrolar.createReview);
router.route("/:id")
    .get(reviewcontrolar.getOneReview)
    .patch(authControlar.restrictUser("user","admin"), reviewcontrolar.updateReview)
    .delete(authControlar.restrictUser("user","admin"), reviewcontrolar.deleteReview);
module.exports = router;

