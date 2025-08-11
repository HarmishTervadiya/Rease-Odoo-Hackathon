import React from "react";
import {
  HeartIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { BoxIcon } from "./Icons";

// --- ProductCard.js ---
export const ProductCard = ({ product }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center group">
    <div className="relative w-full h-40 bg-gray-700 rounded-md mb-4 flex items-center justify-center">
      <BoxIcon className="h-16 w-16 text-gray-500" />
    </div>
    <h3 className="font-semibold text-white">{product.name}</h3>
    <p className="text-indigo-400 font-bold mb-3">
      ${product.price.toFixed(2)}
    </p>
    <div className="flex justify-center items-center gap-2">
      <button className="flex-grow bg-indigo-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
        <ShoppingCartIcon className="h-4 w-4" />
        Add to Cart
      </button>
      <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
        <HeartIcon className="h-5 w-5 text-white" />
      </button>
    </div>
  </div>
);

// --- Filters.js ---
export const Filters = () => {
  const filterGroups = [
    { name: "Colors", options: ["Red", "Blue", "Green", "Black"] },
    { name: "Price range", options: ["$0 - $50", "$50 - $100", "$100 - $200"] },
  ];
  return (
    <aside className="w-full md:w-1/4 lg:w-1/5">
      <h2 className="text-lg font-bold mb-4">Product attributes</h2>
      {filterGroups.map((group) => (
        <div key={group.name} className="mb-6">
          <h3 className="font-semibold mb-2">{group.name}</h3>
          <ul className="space-y-1 text-gray-400">
            {group.options.map((option) => (
              <li key={option}>
                <a href="#" className="hover:text-white">
                  {option}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
};

// --- ShopHeader.js ---
export const ShopHeader = () => (
  <div className="mb-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2 overflow-x-auto">
        {[
          "Category 1",
          "Category 2",
          "Category 3",
          "Category 4",
          "Category 5",
        ].map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 text-sm rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
      <div className="relative w-full md:w-1/3">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Price List"
          className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full">
          <option>Sort by</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-800 border border-gray-700">
          <button className="p-1.5 rounded-md bg-indigo-600">
            <Squares2X2Icon className="h-5 w-5 text-white" />
          </button>
          <button className="p-1.5 rounded-md hover:bg-gray-700">
            <Bars3Icon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Pagination.js ---
export const Pagination = () => (
  <div className="flex justify-center items-center gap-2 mt-8">
    <button className="p-2 rounded-md hover:bg-gray-700 text-gray-400">
      &lt;
    </button>
    <button className="w-8 h-8 rounded-md bg-indigo-600 text-white font-bold">
      1
    </button>
    <button className="w-8 h-8 rounded-md hover:bg-gray-700 text-gray-400">
      2
    </button>
    <button className="w-8 h-8 rounded-md hover:bg-gray-700 text-gray-400">
      3
    </button>
    <span className="text-gray-500">...</span>
    <button className="w-8 h-8 rounded-md hover:bg-gray-700 text-gray-400">
      10
    </button>
    <button className="p-2 rounded-md hover:bg-gray-700 text-gray-400">
      &gt;
    </button>
  </div>
);
