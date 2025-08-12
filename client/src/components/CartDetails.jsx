import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  ChevronRightIcon,
  HomeIcon,
  TagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { BoxIcon } from "./Icons";
// import {  } from "../utils/cookies.js";
import { useAuth } from "@clerk/clerk-react";

const CartScreen = () => {
  const { userId } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = userId;
      if (!token) {
        setError("Please login to view your cart");
        setLoading(false);
        return;
      }

      console.log(token);

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${baseUrl}/api/v1/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        // Use orderLines if available, otherwise fall back to items
        const cartData =
          response.data.data.orderLines || response.data.data.items || [];
        setCartItems(cartData);
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, updates) => {
    try {
      setUpdatingItem(itemId);
      const token = userId;
      if (!token) {
        alert("Please login to update cart");
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.put(
        `${baseUrl}/api/v1/cart/update/${itemId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        // Update local state
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, ...updates } : item
          )
        );
        // Dispatch cart update event to update header cart count
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      }
    } catch (err) {
      console.error("Error updating cart item:", err);
      alert(err.response?.data?.message || "Failed to update cart item");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeCartItem = async (itemId) => {
    if (!confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }

    try {
      const token = userId;
      if (!token) {
        alert("Please login to remove items");
        return;
      }

      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      await axios.delete(`${baseUrl}/api/v1/cart/remove/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
      // Dispatch cart update event to update header cart count
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      alert("Item removed from cart successfully!");
    } catch (err) {
      console.error("Error removing cart item:", err);
      alert(err.response?.data?.message || "Failed to remove item from cart");
    }
  };

  const handleQuantityChange = (item, increment) => {
    const newQuantity = Math.max(1, item.quantity + increment);
    const maxQuantity =
      item.productId?.inventory?.availableQuantity ||
      item.productId?.baseQuantity ||
      1;

    if (newQuantity > maxQuantity) {
      alert(`Only ${maxQuantity} units available`);
      return;
    }

    updateCartItem(item._id, { quantity: newQuantity });
  };

  const calculateDays = (startDate, endDate) => {
    return Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    );
  };

  const calculateItemTotal = (item) => {
    const days = calculateDays(item.startDate, item.endDate);
    const pricePerDay = item.productId?.pricePerDay || 500;
    return item.quantity * pricePerDay * days;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    return appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.value) / 100
      : appliedCoupon.value;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const token = userId;
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await axios.post(
        `${baseUrl}/api/v1/coupon/apply`,
        {
          couponCode: couponCode.trim(),
          cartTotal: calculateSubtotal(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.data) {
        setAppliedCoupon(response.data.data);
        alert("Coupon applied successfully!");
      }
    } catch (err) {
      console.error("Error applying coupon:", err);
      alert(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    // TODO: Implement checkout functionality
    alert("Checkout functionality coming soon!");

    // Navigate to checkout with cart data
    // navigate("/checkout", {
    //   state: {
    //     cartItems,
    //     subtotal: calculateSubtotal(),
    //     discount: calculateDiscount(),
    //     total: calculateTotal(),
    //     appliedCoupon,
    //   },
    // });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-white text-lg">Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Link to="/sign-in" className="text-indigo-400 hover:text-indigo-300">
            Login to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Link to="/" className="flex items-center hover:text-white">
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <Link to="/dashboard" className="hover:text-white">
              All Products
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-white">Shopping Cart</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCartIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <span className="bg-indigo-600 text-white text-sm px-2 py-1 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCartIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-400 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some products to get started!
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {item.productId?.images &&
                      item.productId.images.length > 0 ? (
                        <img
                          src={item.productId.images[0].uri}
                          alt={item.productId.productName}
                          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                          <BoxIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {item.productId?.productName || "Unknown Product"}
                        </h3>
                        <button
                          onClick={() => removeCartItem(item._id)}
                          className="text-red-400 hover:text-red-300 p-2"
                          title="Remove from cart"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Rental Period */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString()} -{" "}
                            {new Date(item.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {calculateDays(item.startDate, item.endDate)} days
                        </span>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={
                                updatingItem === item._id || item.quantity <= 1
                              }
                              className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="text-white font-medium min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={updatingItem === item._id}
                              className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            ₹{item.productId?.pricePerDay || 500} ×{" "}
                            {item.quantity} ×{" "}
                            {calculateDays(item.startDate, item.endDate)} days
                          </div>
                          <div className="text-lg font-semibold text-indigo-400">
                            ₹{calculateItemTotal(item).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Update Loading State */}
                      {updatingItem === item._id && (
                        <div className="mt-2 text-sm text-indigo-400">
                          Updating...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">
                    Apply Coupon
                  </h3>
                  {appliedCoupon ? (
                    <div className="bg-green-600 bg-opacity-20 border border-green-600 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-medium">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-sm text-green-300 mt-1">
                        {appliedCoupon.type === "percentage"
                          ? `${appliedCoupon.value}% off`
                          : `₹${appliedCoupon.value} off`}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₹{calculateSubtotal().toLocaleString()}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-300">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-xl font-semibold text-white">
                      <span>Total</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/dashboard"
                  className="block text-center text-indigo-400 hover:text-indigo-300 mt-4 text-sm"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartScreen;
