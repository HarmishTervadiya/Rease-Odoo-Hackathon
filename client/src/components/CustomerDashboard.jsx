import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ProductCard,
  Filters,
  ShopHeader,
  Pagination,
} from "./AllShopComponents";

const CustomerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <Filters />
      <div className="flex-1">
        <ShopHeader categories={categories} />
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No products available</div>
          </div>
        )}
        <Pagination />
      </div>
    </div>
  );
};

export { CustomerDashboard };
