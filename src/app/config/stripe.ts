import Stripe from "stripe";
import { envVars } from "./index";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-01-28.clover",
});

export default stripe;