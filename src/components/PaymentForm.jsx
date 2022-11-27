import { v4 as uuidv4 } from "uuid";
import { Button, HelperText } from "@windmill/react-ui";
import API from "api/axios.config";
import { useCart } from "context/CartContext";
import toast from "react-hot-toast";
import { formatCurrency } from "helpers/formatCurrency";
import React, { useState } from "react";
import { useHistory } from "react-router";
import PulseLoader from "react-spinners/PulseLoader";
import OrderService from "services/order.service";
import OrderSummary from "./OrderSummary";
import PaystackBtn from "./PaystackBtn";

const PaymentForm = ({ previousStep, addressData, nextStep }) => {
	const { cartSubtotal, cartTotal, cartData, setCartData } = useCart();
	const [error, setError] = useState();
	const [isProcessing, setIsProcessing] = useState(false);
	// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUB_KEY);
	const history = useHistory();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError();
		try {
			setIsProcessing(true);
			const { fullname, email, address, city, state } = addressData;

			// Mock payment
			const data = {
				id: uuidv4(),
				amount: (cartSubtotal * 100).toFixed(),
				billing_details: {
					name: fullname,
					email,
					address: {
						city,
						line1: address,
						state,
						country: "NG", // TODO: change later
					},
				},
			};

			OrderService.createOrder(cartSubtotal, cartTotal, data.id, "STRIPE").then(
				() => {
					setCartData({ ...cartData, items: [] });
					setIsProcessing(false);
					toast.success("Successfully paied");
					history.push({
						pathname: "/cart/success",
						state: {
							fromPaymentPage: true,
						},
					});
				}
			);
		} catch (error) {
			setIsProcessing(false);
		}
	};

	return (
		<div className="w-full md:w-1/2">
			<h1 className="text-3xl font-semibold text-center mb-2">Checkout</h1>
			<OrderSummary />
			<Button disabled={isProcessing} onClick={handleSubmit} className="w-full">
				Pay ${formatCurrency(cartSubtotal)}
			</Button>
		</div>
	);
};

export default PaymentForm;
