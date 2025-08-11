import React from "react";
import { Link } from "react-router-dom";
import { SearchIcon } from "./Icons";

// --- Sub-components for the Vendor Dashboard ---
// In a larger app, you might move these to their own files.

export const DashboardNav = () => {
  const navItems = [
    "Dashboard",
    "Rental",
    "Order",
    "Products",
    "Reporting",
    "Setting",
  ];
  return (
    <nav className="flex items-center border border-gray-700 rounded-lg p-1 bg-gray-800/50 mb-6 overflow-x-auto">
      {navItems.map((item, index) => {
        if (item === "Order") {
          return (
            <Link
              to="/rental-order/R0001"
              key={item}
              className={`px-4 py-2 text-sm rounded-md transition-colors flex-shrink-0 text-gray-300 hover:bg-gray-700`}
            >
              {item}
            </Link>
          );
        }
        if (item === "Products") {
          return (
            <Link
              to="/products/register"
              key={item}
              className={`px-4 py-2 text-sm rounded-md transition-colors flex-shrink-0 text-gray-300 hover:bg-gray-700`}
            >
              {item}
            </Link>
          );
        }
        return (
          <button
            key={item}
            className={`px-4 py-2 text-sm rounded-md transition-colors flex-shrink-0 ${
              index === 0
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
};

export const DashboardHeader = () => (
  <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
    <div className="relative w-full md:w-1/3">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder="Search"
        className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
    <select className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-auto">
      <option>Last 30 days</option>
      <option>Last 60 days</option>
      <option>Last 90 days</option>
    </select>
  </div>
);

export const StatCard = ({ title, value }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

export const DataTable = ({ title, headers, data }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <h3 className="font-bold mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((header) => (
              <th key={header} className="p-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-gray-800 last:border-b-0"
            >
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex} className="p-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- Main VendorDashboard Component ---

const VendorDashboard = () => {
  const mockData = {
    stats: [
      { title: "Quotations", value: "10" },
      { title: "Rentals", value: "26" },
      { title: "Revenue", value: "$10,599" },
    ],
    topCategories: {
      headers: ["Category", "Ordered", "Revenue"],
      data: [{ category: "Rental - Service", ordered: 25, revenue: 2940 }],
    },
    topProducts: {
      headers: ["Product", "Ordered", "Revenue"],
      data: [
        { product: "Wheelchairs", ordered: 10, revenue: 3032 },
        { product: "Tables", ordered: 5, revenue: 1008 },
        { product: "Chairs", ordered: 4, revenue: 3008 },
      ],
    },
    topCustomers: {
      headers: ["Customer", "Ordered", "Revenue"],
      data: [
        { customer: "Customer1", ordered: 10, revenue: 3032 },
        { customer: "Customer2", ordered: 5, revenue: 1008 },
        { customer: "Customer3", ordered: 4, revenue: 3008 },
      ],
    },
  };

  return (
    <div>
      <DashboardNav />
      <DashboardHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {mockData.stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable title="Top Product Categories" {...mockData.topCategories} />
        <DataTable title="Top Products" {...mockData.topProducts} />
        <DataTable title="Top Customer" {...mockData.topCustomers} />
      </div>
      <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg mt-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-indigo-300">
              Manage Your Product Inventory
            </h3>
            <p className="text-gray-400 mt-1">
              Add new products to your rental shop or view your existing
              inventory.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/products/register"
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors"
            >
              + Add New Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export  {VendorDashboard};
