import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getCookie } from "../utils/cookies.js";

const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Use only MongoDB user id stored in cookie
      const mongoUserId = getCookie("userIdDB") || "";
      console.log("mongo userIdDB from cookies:", mongoUserId);

      if (!mongoUserId) {
        setError(
          "MongoDB user ID not found. Please complete signup or log in again."
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      const baseUrl = "http://localhost:3000";
      const response = await axios.get(
        `${baseUrl}/api/v1/product/vendor/${mongoUserId}`
      );
      setProducts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      console.log("Attempting to delete product:", productId);
      // Note: You'll need to add a delete endpoint in your backend
      // await axios.delete(`${baseUrl}/api/v1/product/${productId}`);
      alert("Delete functionality needs to be implemented in backend");
      // Refresh products after deletion
      // fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">My Products</h1>
        <div className="flex gap-3">
          <Link
            to="/quotation/create"
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Quotation
          </Link>
          <Link
            to="/products/register"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">No products found</p>
          <p className="text-gray-500 mb-6">
            Start by adding your first product to your rental shop
          </p>
          <Link
            to="/products/register"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].uri}
                    alt={product.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm">No Image</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white truncate">
                  {product.productName}
                </h3>

                <p className="text-gray-400 text-sm line-clamp-2">
                  {product.productInfo || "No description available"}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Quantity: {product.baseQuantity}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.status === "available"
                        ? "bg-green-900 text-green-300"
                        : product.status === "unavailable"
                        ? "bg-red-900 text-red-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={() =>
                      alert("Edit functionality needs to be implemented")
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <Link
                    to={`/quotation/create/${product._id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Quotation
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;
