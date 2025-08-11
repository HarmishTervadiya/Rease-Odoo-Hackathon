import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


export const createPaymentLink = async ({ customer, amount, description }) => {
  try {
    const paymentLink = await razorpay.paymentLink.create({
      amount: amount * 100, 
      currency: "INR",
      customer: {
        name: customer.name,
        email: customer.email,
        contact: customer.mobileNo
      },
      description,
      callback_url: `${process.env.FRONTEND_URL}/payment-status`,
      callback_method: "get"
    });

    return { success: true, paymentLink };
  } catch (error) {
    console.error("Error creating payment link:", error);
    return { success: false, error };
  }
};