import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CustomerOrder } from "../models/customerOrder.js";
import { RentalOrder } from "../models/rentalOrder.model.js";
import { RentalOrderLine } from "../models/rentalOrderLine.model.js";
import { Product } from "../models/product.model.js";
import { Inventory } from "../models/inventory.model.js";

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, startDate, endDate, couponCode } = req.body;

  if (!productId || !quantity || !startDate || !endDate) {
    throw new ApiError(
      400,
      "Product ID, quantity, start date, and end date are required"
    );
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    throw new ApiError(400, "Start date cannot be in the past");
  }

  if (end <= start) {
    throw new ApiError(400, "End date must be after start date");
  }

  // Check if product exists and is available
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.status !== "available") {
    throw new ApiError(400, "Product is not available for rental");
  }

  // Check inventory availability
  const inventory = await Inventory.findOne({ productId });
  if (!inventory || inventory.availableQuantity < quantity) {
    throw new ApiError(400, "Insufficient inventory available");
  }

  // Get or create customer order (cart)
  let customerOrder = await CustomerOrder.findOne({
    customerId: req.user._id,
    status: "draft",
  });

  if (!customerOrder) {
    customerOrder = await CustomerOrder.create({
      customerId: req.user._id,
      status: "draft",
      rentFrom: start,
      rentTo: end,
    });
  }

  // Check if product already exists in cart
  const existingRentalOrder = await RentalOrder.findOne({
    customerOrderId: customerOrder._id,
    vendorId: product.ownerId,
  });

  let rentalOrder;
  if (!existingRentalOrder) {
    // Create new rental order for this vendor
    rentalOrder = await RentalOrder.create({
      customerOrderId: customerOrder._id,
      vendorId: product.ownerId,
      status: "pending",
    });
  } else {
    rentalOrder = existingRentalOrder;
  }

  // Check if product already exists in this rental order
  const existingOrderLine = await RentalOrderLine.findOne({
    rentalOrderId: rentalOrder._id,
    productId: productId,
  });

  if (existingOrderLine) {
    throw new ApiError(400, "Product already in cart");
  }

  // Calculate rental period in days
  const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Calculate unit price (you might want to get this from a pricing model)
  const unitPrice = 500; // Default price, should come from product pricing

  // Calculate line total
  const lineTotal = unitPrice * quantity * rentalDays;

  // Create rental order line
  const rentalOrderLine = await RentalOrderLine.create({
    rentalOrderId: rentalOrder._id,
    productId: productId,
    productSnapshot: {
      productName: product.productName,
      productInfo: product.productInfo,
      images: product.images,
    },
    quantity: quantity,
    from: start,
    to: end,
    unitPrice: unitPrice,
    lineTotal: lineTotal,
    status: "reserved",
  });

  // Update customer order total
  const allOrderLines = await RentalOrderLine.find({
    rentalOrderId: {
      $in: await RentalOrder.find({
        customerOrderId: customerOrder._id,
      }).distinct("_id"),
    },
  });

  const totalAmount = allOrderLines.reduce(
    (sum, line) => sum + line.lineTotal,
    0
  );

  await CustomerOrder.findByIdAndUpdate(customerOrder._id, {
    totalAmount: totalAmount,
    rentFrom: start < customerOrder.rentFrom ? start : customerOrder.rentFrom,
    rentTo: end > customerOrder.rentTo ? end : customerOrder.rentTo,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { rentalOrderLine, customerOrder },
        "Added to cart successfully"
      )
    );
});

const getCart = asyncHandler(async (req, res) => {
  const customerOrder = await CustomerOrder.findOne({
    customerId: req.user._id,
    status: "draft",
  });

  if (!customerOrder) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { items: [], totalAmount: 0 }, "Cart is empty")
      );
  }

  const rentalOrders = await RentalOrder.find({
    customerOrderId: customerOrder._id,
  });
  const orderLines = await RentalOrderLine.find({
    rentalOrderId: { $in: rentalOrders.map((ro) => ro._id) },
  }).populate({
    path: "productId",
    select: "productName productInfo images baseQuantity status",
  });

  // Get inventory information for each product
  for (let line of orderLines) {
    if (line.productId) {
      const inventory = await Inventory.findOne({
        productId: line.productId._id,
      });
      if (inventory) {
        line.productId = line.productId.toObject();
        line.productId.inventory = inventory;
      }
    }
  }

  // Map the fields to match what the frontend expects
  const mappedOrderLines = orderLines.map((line) => ({
    ...line.toObject(),
    startDate: line.from,
    endDate: line.to,
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        customerOrder,
        rentalOrders,
        orderLines: mappedOrderLines,
        totalAmount: customerOrder.totalAmount,
        items: mappedOrderLines, // Add this for backward compatibility
      },
      "Cart fetched successfully"
    )
  );
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { orderLineId } = req.params;
  const updates = req.body;

  if (!orderLineId) {
    throw new ApiError(400, "Order line ID is required");
  }

  const orderLine = await RentalOrderLine.findById(orderLineId);
  if (!orderLine) {
    throw new ApiError(404, "Order line not found");
  }

  // Verify the order belongs to the user
  const rentalOrder = await RentalOrder.findById(orderLine.rentalOrderId);
  const customerOrder = await CustomerOrder.findById(
    rentalOrder.customerOrderId
  );

  if (customerOrder.customerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to update this item");
  }

  // Update the order line
  const updatedOrderLine = await RentalOrderLine.findByIdAndUpdate(
    orderLineId,
    updates,
    { new: true }
  );

  // Recalculate total amount
  const allOrderLines = await RentalOrderLine.find({
    rentalOrderId: {
      $in: await RentalOrder.find({
        customerOrderId: customerOrder._id,
      }).distinct("_id"),
    },
  });

  const totalAmount = allOrderLines.reduce(
    (sum, line) => sum + line.lineTotal,
    0
  );

  await CustomerOrder.findByIdAndUpdate(customerOrder._id, {
    totalAmount: totalAmount,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedOrderLine, "Cart item updated successfully")
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { orderLineId } = req.params;

  const orderLine = await RentalOrderLine.findById(orderLineId);
  if (!orderLine) {
    throw new ApiError(404, "Order line not found");
  }

  // Verify the order belongs to the user
  const rentalOrder = await RentalOrder.findById(orderLine.rentalOrderId);
  const customerOrder = await CustomerOrder.findById(
    rentalOrder.customerOrderId
  );

  if (customerOrder.customerId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized to remove this item");
  }

  await RentalOrderLine.findByIdAndDelete(orderLineId);

  // Update customer order total
  const remainingOrderLines = await RentalOrderLine.find({
    rentalOrderId: {
      $in: await RentalOrder.find({
        customerOrderId: customerOrder._id,
      }).distinct("_id"),
    },
  });

  const totalAmount = remainingOrderLines.reduce(
    (sum, line) => sum + line.lineTotal,
    0
  );

  await CustomerOrder.findByIdAndUpdate(customerOrder._id, {
    totalAmount: totalAmount,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Item removed from cart successfully"));
});

export { addToCart, getCart, updateCartItem, removeFromCart };
