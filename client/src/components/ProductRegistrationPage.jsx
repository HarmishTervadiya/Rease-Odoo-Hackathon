import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { ArrowUpOnSquareIcon, XCircleIcon } from "@heroicons/react/24/solid";

const ProductRegistrationPage = () => {
  useUser();
  const [formData, setFormData] = useState({
    productName: "",
    productInfo: "",
    categoryId: "",
    status: "available",
    baseQuantity: 1,
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fetch categories from API on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        const { data } = await axios.get(`${baseUrl}/api/v1/category`);
        // data shape: ApiResponse { statusCode, data, message }
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // State to hold categories fetched from API
  const [categories, setCategories] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { isSignedIn, userId } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl = "http://localhost:3000";
      const token = userId
      if (!isSignedIn || !token) throw new Error("Not signed in");

      const multipart = new FormData();
      multipart.append("productName", formData.productName);
      multipart.append("productInfo", formData.productInfo);
      multipart.append("categoryId", formData.categoryId);
      multipart.append("baseQuantity", String(formData.baseQuantity));
      // images
      images.forEach((file) => multipart.append("productImgs", file));
    console.log("Submitting product:", userId)
      await axios.post(`${baseUrl}/api/v1/product/addProduct`, multipart, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: false,
      });

      setIsSubmitting(false);
      alert("Product registered successfully!");
    } catch (err) {
      console.error("Error submitting product:", err);
      setIsSubmitting(false);
      alert(err?.response?.data?.message || err.message || "Failed to submit");
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Register a New Product
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-300"
            >
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              id="productName"
              value={formData.productName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Base Quantity */}
          <div>
            <label
              htmlFor="baseQuantity"
              className="block text-sm font-medium text-gray-300"
            >
              Base Quantity
            </label>
            <input
              type="number"
              name="baseQuantity"
              id="baseQuantity"
              value={formData.baseQuantity}
              onChange={handleInputChange}
              min="1"
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-gray-300"
            >
              Category
            </label>
            <select
              name="categoryId"
              id="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.categoryName || cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-300"
            >
              Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <label
            htmlFor="productInfo"
            className="block text-sm font-medium text-gray-300"
          >
            Product Information
          </label>
          <textarea
            name="productInfo"
            id="productInfo"
            value={formData.productInfo}
            onChange={handleInputChange}
            rows="4"
            className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Product Images
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <ArrowUpOnSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
                >
                  <span>Upload files</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`preview ${index}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-gray-800 rounded-full"
                  >
                    <XCircleIcon className="h-6 w-6 text-red-500 hover:text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductRegistrationPage;
