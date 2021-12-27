const router = require("express").Router();
const apiUser = require("../api/userApi");
const verifyToken = require("../middlewares/verifyToken");

router.post("/", apiUser.createUser());

router.post("/signIn", apiUser.signInUser());

router.post("/forgotPasswordStepOne", apiUser.forgotPasswordStepOne());

router.post("/forgotPasswordValidToken", apiUser.forgotPasswordValidToken());

router.post("/forgotPasswordStepTwo", apiUser.forgotPasswordStepTwo());

router.get("/verifyToken", verifyToken, apiUser.verifyToken());

module.exports = router;