const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripe.controller");

router.get("/stripe/config", stripeController.getStripeConfig);
router.post("/stripe/create-payment-intent", stripeController.createPaymentIntent);
router.post("/stripe/status-update", stripeController.broadcastPaymentStatus);

module.exports = router;
