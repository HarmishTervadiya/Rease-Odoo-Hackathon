import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ProductCard,
  Filters,
  ShopHeader,
  Pagination,
} from "./AllShopComponents";
import { Squares2X2Icon, Bars3Icon } from "@heroicons/react/24/outline";

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [layout, setLayout] = useState("grid"); // "grid" or "list"

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${baseUrl}/api/v1/product/all`);

      if (response.data && response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${baseUrl}/api/v1/category`);

      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Filter products based on search, category, and price range
  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productInfo?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "" || product.categoryId === selectedCategory;

    // Price range filter (assuming baseQuantity * 500 as price)
    const productPrice = product.baseQuantity * 500;
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;

    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange.min, priceRange.max]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId);
  };

  const handlePriceRangeChange = (field, value) => {
    setPriceRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Enhanced Filters Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Clear All
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Search</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat._id}
                    onChange={() => handleCategoryFilter(cat._id)}
                    className="mr-2 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-300 hover:text-white cursor-pointer">
                    {cat.categoryName}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) =>
                    handlePriceRangeChange("min", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={priceRange.max}
                  onChange={(e) =>
                    handlePriceRangeChange("max", e.target.value)
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Price Filters */}
          <div className="mb-6">
            <h3 className="font-semibold text-white mb-3">Quick Filters</h3>
            <div className="space-y-2">
              {[
                { label: "Under ₹1000", min: 0, max: 1000 },
                { label: "₹1000 - ₹3000", min: 1000, max: 3000 },
                { label: "₹3000 - ₹5000", min: 3000, max: 5000 },
                { label: "Over ₹5000", min: 5000, max: 100000 },
              ].map((filter) => (
                <button
                  key={filter.label}
                  onClick={() =>
                    setPriceRange({
                      min: filter.min.toString(),
                      max: filter.max.toString(),
                    })
                  }
                  className="block w-full text-left text-sm text-gray-300 hover:text-white py-1"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-400">
            {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Enhanced Header with Layout Toggle and Pagination Controls */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryFilter(cat._id)}
                    className={`px-4 py-2 text-sm rounded-md border transition-colors flex-shrink-0 ${
                      selectedCategory === cat._id
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                ))
              ) : (
                <div className="text-gray-400 text-sm">
                  No categories available
                </div>
              )}
            </div>

            {/* Layout Toggle and Items Per Page */}
            <div className="flex items-center gap-4">
              {/* Items Per Page */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">View:</span>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-700 border border-gray-600">
                  <button
                    onClick={() => handleLayoutChange("grid")}
                    className={`p-1.5 rounded-md transition-colors ${
                      layout === "grid"
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleLayoutChange("list")}
                    className={`p-1.5 rounded-md transition-colors ${
                      layout === "list"
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {currentProducts.length > 0 ? (
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {currentProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                layout={layout}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              {searchQuery ||
              selectedCategory ||
              priceRange.min ||
              priceRange.max
                ? "No products found matching your criteria"
                : "No products available"}
            </div>
            {(searchQuery ||
              selectedCategory ||
              priceRange.min ||
              priceRange.max) && (
              <button
                onClick={clearFilters}
                className="mt-4 text-indigo-400 hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              startIndex={startIndex}
              endIndex={endIndex}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { CustomerDashboard };
