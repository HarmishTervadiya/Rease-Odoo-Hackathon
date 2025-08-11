import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  HeartIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ShareIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { BoxIcon } from "./Icons";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rental form state
  const [rentalData, setRentalData] = useState({
    startDate: "",
    endDate: "",
    quantity: 1,
    couponCode: "",
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(
        `${baseUrl}/api/v1/product/${productId}`
      );

      if (response.data && response.data.data) {
        setProduct(response.data.data);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRentalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (increment) => {
    const newQuantity = Math.max(1, rentalData.quantity + increment);
    setRentalData((prev) => ({
      ...prev,
      quantity: newQuantity,
    }));
  };

  const handleAddToCart = async () => {
    if (!rentalData.startDate || !rentalData.endDate) {
      alert("Please select rental dates");
      return;
    }

    if (new Date(rentalData.startDate) >= new Date(rentalData.endDate)) {
      alert("End date must be after start date");
      return;
    }

    setIsAddingToCart(true);
    try {
      // TODO: Implement add to cart functionality
      console.log("Adding to cart:", {
        productId,
        ...rentalData,
      });

      alert("Product added to cart successfully!");
      // Navigate to cart or stay on page
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add product to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    alert("Added to wishlist!");
  };

  const handleApplyCoupon = () => {
    // TODO: Implement coupon functionality
    alert("Coupon applied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.productName,
        text: product?.productInfo,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400 text-lg">
          {error || "Product not found"}
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
            <span className="text-white">{product.productName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Image and Description */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].uri}
                  alt={product.productName}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-700 flex items-center justify-center">
                  <BoxIcon className="h-24 w-24 text-gray-500" />
                </div>
              )}
            </div>

            {/* Add to Wishlist Button */}
            <button
              onClick={handleAddToWishlist}
              className="w-full bg-gray-800 border border-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <HeartIcon className="h-5 w-5" />
              Add to Wish List
            </button>

            {/* Product Description */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Product Description
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {product.productInfo || "No description available."}
              </p>
              <button className="text-indigo-400 hover:text-indigo-300 mt-2 text-sm">
                Read More &gt;
              </button>
            </div>
          </div>

          {/* Right Column - Product Details and Rental Form */}
          <div className="space-y-6">
            {/* Product Name and Status */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {product.productName}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-400">
                  ₹ 1000
                </span>
                <span className="text-gray-400">(₹500 / per unit)</span>
              </div>
              <div className="mt-2">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    product.status === "available"
                      ? "bg-green-600 text-green-100"
                      : product.status === "unavailable"
                      ? "bg-yellow-600 text-yellow-100"
                      : "bg-red-600 text-red-100"
                  }`}
                >
                  {product.status}
                </span>
              </div>
            </div>

            {/* Rental Period Selection */}
            <div className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Select Rental Period
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="startDate"
                      value={rentalData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="endDate"
                      value={rentalData.endDate}
                      onChange={handleInputChange}
                      min={
                        rentalData.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-white min-w-[3rem] text-center">
                  {rentalData.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                >
                  +
                </button>
                <span className="text-gray-400 ml-4">
                  Available: {product.baseQuantity}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.status !== "available"}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
            </button>

            {/* Apply Coupon */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Apply Coupon
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="couponCode"
                  value={rentalData.couponCode}
                  onChange={handleInputChange}
                  placeholder="Coupon Code"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-500 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Terms & Conditions
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                By renting this product, you agree to our terms and conditions.
                Please ensure the product is returned in the same condition as
                received. Late returns may incur additional charges.
              </p>
            </div>

            {/* Share Option */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Share:</span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
                >
                  <ShareIcon className="h-5 w-5" />
                  Share Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
