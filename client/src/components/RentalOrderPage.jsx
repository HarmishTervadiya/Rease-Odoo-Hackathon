import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// --- Reusable Components for this page ---

const OrderHeader = ({ orderId }) => (
  <div className="flex justify-between items-center mb-4">
    <div className="flex items-center gap-4">
      <button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors">
        Create
      </button>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Rental Orders</h2>
        <span className="text-gray-400 text-sm">{orderId}</span>
      </div>
    </div>
    <div className="flex items-center gap-2 text-gray-400">
      <span>1/80</span>
      <button className="p-1 rounded-md hover:bg-gray-700">
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      <button className="p-1 rounded-md hover:bg-gray-700">
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
);

const OrderActionBar = () => {
  const actions = ["Sent", "Print", "Confirm", "Cancel"];
  return (
    <div className="flex items-center gap-2 mb-4">
      {actions.map((action) => (
        <button
          key={action}
          className="bg-gray-700 text-gray-300 text-sm py-1 px-3 rounded-md hover:bg-gray-600"
        >
          {action}
        </button>
      ))}
    </div>
  );
};

const OrderStatusTracker = () => {
  const statuses = ["Quotation", "Quotation Sent", "Rental Order"];
  const currentStatus = "Rental Order"; // Mock current status

  return (
    <div className="flex items-center gap-2 mb-6">
      {statuses.map((status, index) => (
        <React.Fragment key={status}>
          <div
            className={`px-3 py-1 text-sm rounded-full ${
              status === currentStatus
                ? "bg-yellow-500 text-gray-900 font-bold"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {status}
          </div>
          {index < statuses.length - 1 && (
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const OrderInfoField = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-400">{label}</label>
    <p className="font-semibold">{value}</p>
  </div>
);

const OrderItemsTable = ({ items }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b-2 border-gray-700">
          <th className="p-2 font-semibold">Product</th>
          <th className="p-2 font-semibold">Quantity</th>
          <th className="p-2 font-semibold">Unit Price</th>
          <th className="p-2 font-semibold">Tax</th>
          <th className="p-2 font-semibold text-right">Sub Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index} className="border-b border-gray-800">
            <td className="p-2">{item.product}</td>
            <td className="p-2">{item.quantity}</td>
            <td className="p-2">{item.unitPrice}</td>
            <td className="p-2">{item.tax}</td>
            <td className="p-2 text-right">{item.subTotal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- Main RentalOrderPage Component ---

export const RentalOrderPage = () => {
  const { orderId } = useParams(); // Gets 'R0001' from the URL
  const [isConfirmed, setIsConfirmed] = useState(false); // To disable the "Update Prices" button

  const mockOrderData = {
    customer: "Pleased Crocodile",
    invoiceAddress: "123 Gator Way, Swampville, FL",
    deliveryAddress: "123 Gator Way, Swampville, FL",
    expiration: "2025-09-10",
    rentalOrderDate: "2025-08-11",
    pricelist: "Uncommon Llama",
    rentalType: "New",
    rentalDuration: "15 Days",
    orderItems: [
      {
        product: "Product 1",
        quantity: 5,
        unitPrice: 200,
        tax: "0%",
        subTotal: 1000,
      },
    ],
    terms: "Standard rental terms and conditions apply.",
    untaxedTotal: 1000,
    tax: 0,
    total: 1000,
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <OrderHeader orderId={orderId} />
      <OrderActionBar />
      <OrderStatusTracker />

      <h1 className="text-3xl font-bold mb-6">{orderId}</h1>

      {/* --- Customer and Date Info --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <OrderInfoField label="Customer" value={mockOrderData.customer} />
          <OrderInfoField
            label="Invoice Address"
            value={mockOrderData.invoiceAddress}
          />
          <OrderInfoField
            label="Delivery Address"
            value={mockOrderData.deliveryAddress}
          />
        </div>
        <div>
          <OrderInfoField label="Expiration" value={mockOrderData.expiration} />
          <OrderInfoField
            label="Rental Order Date"
            value={mockOrderData.rentalOrderDate}
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <OrderInfoField label="Pricelist" value={mockOrderData.pricelist} />
            <OrderInfoField
              label="Rental Type"
              value={mockOrderData.rentalType}
            />
            <OrderInfoField
              label="Rental Duration"
              value={mockOrderData.rentalDuration}
            />
          </div>
          <button
            disabled={isConfirmed}
            className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed self-end"
          >
            Update Prices
          </button>
        </div>
      </div>

      {/* --- Order Items Tabs --- */}
      <div className="border-t border-gray-700 pt-4">
        <div className="flex items-center border-b border-gray-700 mb-4">
          <button className="py-2 px-4 text-sm font-medium border-b-2 border-indigo-500 text-white">
            Order lines
          </button>
          <button className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">
            Other details
          </button>
          <button className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">
            Rental Notes
          </button>
        </div>

        <OrderItemsTable items={mockOrderData.orderItems} />

        <div className="flex justify-between mt-6">
          <div>
            <p className="text-sm text-gray-400">Terms & condition</p>
            <p className="font-semibold">{mockOrderData.terms}</p>
          </div>
          <div className="text-right">
            <div className="flex justify-end gap-6">
              <span className="text-gray-400">Untaxed Total:</span>
              <span>${mockOrderData.untaxedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-6">
              <span className="text-gray-400">Tax:</span>
              <span>${mockOrderData.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-end gap-6 font-bold text-lg border-t border-gray-700 mt-2 pt-2">
              <span className="text-gray-400">Total:</span>
              <span>${mockOrderData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
