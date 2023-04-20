const express = require("express");


const controlar = require("./../controlar/userscontrolar");
const authControlar = require("./../controlar/authControlar");


const router = express.Router();


//////////////////////////////

router.post("/signup", authControlar.signup);
router.post("/login", authControlar.login);
router.get("/logout", authControlar.logout);
router.post("/forgotPassword",authControlar.forgotPassword);
router.patch("/resetpassword/:token", authControlar.resetPassword);

router.use(authControlar.protectTours);

router.patch("/updateMyPassword", authControlar.updatePassword);
router.patch("/updateMe",controlar.uploudUserPhoto,controlar.resizeUserPhoto, controlar.updateMe);
router.delete("/deleteme", controlar.deleteMe);
router.get("/me", controlar.getMe, controlar.getOneUser);

router.use(authControlar.restrictUser("admin"))

router.route("/")
    .get(controlar.getAllUsers)
    .post(controlar.postUsers);
router.route("/:id")
    .get(controlar.getOneUser)
    .patch(controlar.updateUsers)
    .delete(controlar.deleteUsers);

/////////////////////////////////////

module.exports = router;