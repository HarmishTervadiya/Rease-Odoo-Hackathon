import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  HomeIcon,
  ChevronRightIcon,
  CogIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { getCookie } from "../utils/cookies.js";

const CreateQuotationPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setProducts] = useState([]);

  // Form state for quotation
  const [quotationData, setQuotationData] = useState({
    productName: "",
    productInfo: "",
    category: "",
    images: [],
    baseQuantity: 1,
    status: "available",
    pricelists: [
      {
        fromDate: "",
        toDate: "",
        title: "",
        amount: "",
      },
    ],
    extraCharges: {
      extraHour: 50,
      extraDay: 500,
      extraHourWeekend: 75,
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && productId) {
      const index = products.findIndex((p) => p._id === productId);
      if (index !== -1) {
        setCurrentProductIndex(index);
        setProduct(products[index]);
        setQuotationData((prev) => ({
          ...prev,
          productName: products[index].productName || "",
          productInfo: products[index].productInfo || "",
          baseQuantity: products[index].baseQuantity || 1,
          status: products[index].status || "available",
          images: products[index].images || [],
        }));
      }
    }
  }, [products, productId]);

  const fetchProducts = async () => {
    try {
      const mongoUserId = getCookie("userIdDB") || "";
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
      const fetchedProducts = response.data.data || [];
      setProducts(fetchedProducts);
      setTotalProducts(fetchedProducts.length);

      if (fetchedProducts.length > 0) {
        setProduct(fetchedProducts[0]);
        setQuotationData((prev) => ({
          ...prev,
          productName: fetchedProducts[0].productName || "",
          productInfo: fetchedProducts[0].productInfo || "",
          baseQuantity: fetchedProducts[0].baseQuantity || 1,
          status: fetchedProducts[0].status || "available",
          images: fetchedProducts[0].images || [],
        }));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handlePricelistChange = (index, field, value) => {
    const newPricelists = [...quotationData.pricelists];
    newPricelists[index] = { ...newPricelists[index], [field]: value };
    setQuotationData((prev) => ({
      ...prev,
      pricelists: newPricelists,
    }));
  };

  const addPricelistRow = () => {
    setQuotationData((prev) => ({
      ...prev,
      pricelists: [
        ...prev.pricelists,
        {
          fromDate: "",
          toDate: "",
          title: "",
          amount: "",
        },
      ],
    }));
  };

  const removePricelistRow = (index) => {
    if (quotationData.pricelists.length > 1) {
      setQuotationData((prev) => ({
        ...prev,
        pricelists: prev.pricelists.filter((_, i) => i !== index),
      }));
    }
  };

  const handleExtraChargesChange = (field, value) => {
    setQuotationData((prev) => ({
      ...prev,
      extraCharges: {
        ...prev.extraCharges,
        [field]: value,
      },
    }));
  };

  const navigateToProduct = (direction) => {
    let newIndex;
    if (direction === "next") {
      newIndex = (currentProductIndex + 1) % totalProducts;
    } else {
      newIndex =
        currentProductIndex === 0 ? totalProducts - 1 : currentProductIndex - 1;
    }

    setCurrentProductIndex(newIndex);
    setProduct(products[newIndex]);
    setQuotationData((prev) => ({
      ...prev,
      productName: products[newIndex].productName || "",
      productInfo: products[newIndex].productInfo || "",
      baseQuantity: products[newIndex].baseQuantity || 1,
      status: products[newIndex].status || "available",
      images: products[newIndex].images || [],
    }));

    // Update URL without page reload
    navigate(`/quotation/create/${products[newIndex]._id}`);
  };

  const handleCreateQuotation = async () => {
    try {
      // Validate pricelists
      const validPricelists = quotationData.pricelists.filter(
        (pricelist) =>
          pricelist.fromDate &&
          pricelist.toDate &&
          pricelist.title &&
          pricelist.amount
      );

      if (validPricelists.length === 0) {
        alert("Please add at least one valid pricelist with all fields filled");
        return;
      }

      // Call addPricelist API for each pricelist
      const mongoUserId = getCookie("userIdDB") || "";
      if (!mongoUserId) {
        alert("User ID not found. Please login again.");
        return;
      }

      const baseUrl = "http://localhost:3000";
      const results = [];

      for (const pricelist of validPricelists) {
        try {
          const response = await axios.post(
            `${baseUrl}/api/v1/pricelist/add`,
            {
              productId: product._id,
              fromDate: pricelist.fromDate,
              toDate: pricelist.toDate,
              title: pricelist.title,
              amount: parseFloat(pricelist.amount),
              vendorId: mongoUserId,
            },
            {
              headers: {
                Authorization: `Bearer ${mongoUserId}`,
              },
            }
          );
          results.push({ success: true, data: response.data });
        } catch (err) {
          console.error(`Error adding pricelist:`, err);
          results.push({ success: false, error: err.message });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      if (successCount === validPricelists.length) {
        alert(`Successfully created ${successCount} pricelist(s)!`);
        // Reset form or navigate away
        setQuotationData((prev) => ({
          ...prev,
          pricelists: [{ fromDate: "", toDate: "", title: "", amount: "" }],
        }));
      } else {
        alert(
          `Created ${successCount} out of ${validPricelists.length} pricelists. Some failed.`
        );
      }
    } catch (err) {
      console.error("Error creating quotation:", err);
      alert("Failed to create quotation");
    }
  };

  const handleUpdateStock = async () => {
    try {
      // TODO: Implement stock update logic
      alert("Stock update functionality coming soon!");
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock");
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

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No product found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Link>
              <button className="text-gray-400 hover:text-white">
                Dashboard
              </button>
              <button className="text-gray-400 hover:text-white">Rental</button>
              <button className="text-gray-400 hover:text-white">Order</button>
              <button className="text-white font-medium">Products</button>
              <button className="text-gray-400 hover:text-white">
                Reporting
              </button>
              <button className="text-gray-400 hover:text-white">
                Setting
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Management Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Create
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-white text-lg">Product</span>
              <CogIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-white">
                {currentProductIndex + 1}/{totalProducts}
              </span>
              <button
                onClick={() => navigateToProduct("prev")}
                className="p-2 text-gray-400 hover:text-white"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigateToProduct("next")}
                className="p-2 text-gray-400 hover:text-white"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handleUpdateStock}
              className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors"
            >
              Update stock
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Section - General Product Info */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              General Product info
            </h2>

            {/* Product Image */}
            <div className="mb-6">
              {quotationData.images && quotationData.images.length > 0 ? (
                <img
                  src={quotationData.images[0].uri}
                  alt={quotationData.productName}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm">No Image</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Name
                </label>
                <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                  {quotationData.productName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Product Description
                </label>
                <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white min-h-[6rem]">
                  {quotationData.productInfo || "No description available"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Quantity
                  </label>
                  <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                    {quotationData.baseQuantity}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        quotationData.status === "available"
                          ? "bg-green-600 text-green-100"
                          : quotationData.status === "unavailable"
                          ? "bg-yellow-600 text-yellow-100"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {quotationData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Rental Pricing */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Rental Pricing
              </h2>
              <button
                onClick={addPricelistRow}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                title="Add Pricelist"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>

            {/* Pricelist Table */}
            <div className="mb-6">
              <div className="grid grid-cols-4 gap-4 mb-3">
                <div className="text-sm font-medium text-gray-300">
                  From Date
                </div>
                <div className="text-sm font-medium text-gray-300">To Date</div>
                <div className="text-sm font-medium text-gray-300">Title</div>
                <div className="text-sm font-medium text-gray-300">Amount</div>
                <div className="text-sm font-medium text-gray-300">Actions</div>
              </div>

              {quotationData.pricelists.map((pricelist, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 mb-3">
                  <input
                    type="date"
                    value={pricelist.fromDate}
                    onChange={(e) =>
                      handlePricelistChange(index, "fromDate", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={pricelist.toDate}
                    onChange={(e) =>
                      handlePricelistChange(index, "toDate", e.target.value)
                    }
                    min={
                      pricelist.fromDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={pricelist.title}
                    onChange={(e) =>
                      handlePricelistChange(index, "title", e.target.value)
                    }
                    placeholder="Enter title"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    value={pricelist.amount}
                    onChange={(e) =>
                      handlePricelistChange(index, "amount", e.target.value)
                    }
                    placeholder="Enter amount"
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removePricelistRow(index)}
                      disabled={quotationData.pricelists.length === 1}
                      className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove Pricelist"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Rental Reservations Charges */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">
                Rental Reservations charges
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm w-24">
                    Extra Hour:
                  </span>
                  <input
                    type="number"
                    value={quotationData.extraCharges.extraHour}
                    onChange={(e) =>
                      handleExtraChargesChange(
                        "extraHour",
                        parseInt(e.target.value)
                      )
                    }
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-300 text-sm">Rs</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm w-24">
                    Extra Days:
                  </span>
                  <input
                    type="number"
                    value={quotationData.extraCharges.extraDay}
                    onChange={(e) =>
                      handleExtraChargesChange(
                        "extraDay",
                        parseInt(e.target.value)
                      )
                    }
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-300 text-sm">Rs</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm w-24">
                    Extra Hour:
                  </span>
                  <input
                    type="number"
                    value={quotationData.extraCharges.extraHourWeekend}
                    onChange={(e) =>
                      handleExtraChargesChange(
                        "extraHourWeekend",
                        parseInt(e.target.value)
                      )
                    }
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-300 text-sm">Rs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateQuotation}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Create Quotation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationPage;
