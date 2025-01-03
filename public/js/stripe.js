/* eslint-disable */

import axios from 'axios';
//const Stripe = require('stripe');
import { showAlert } from './alerts';
import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async (tourId) => {
  try {
    // 1) Initialize Stripe
    const stripe = loadStripe(
      'pk_test_51QbE60RsHrmP6iEBCRuU0rgPNqNLyyUH3csrkuAfc6OO1hIsAQElKmJi9GIIgdItIILmmuB9N6jZQKb9sJOpxqQ800YnoJLO3Q',
    );

    // const stripe = await loadStripe(
    //   'pk_test_51QbE60RsHrmP6iEBCRuU0rgPNqNLyyUH3csrkuAfc6OO1hIsAQElKmJi9GIIgdItIILmmuB9N6jZQKb9sJOpxqQ800YnoJLO3Q',
    // );

    // 2) Get checkout session from API
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    const session = response.data.session;

    // 3) Redirect to checkout
    window.location.assign(session.url);
    //await stripe.redirectToCheckout({ sessionId: session.id });
  } catch (err) {
    showAlert('error', 'Something went wrong. Please try again.');
  }
};
