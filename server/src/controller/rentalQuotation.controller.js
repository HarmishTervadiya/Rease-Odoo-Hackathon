import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { RentalQuotation } from "../models/rentalQuotation.js";

export const deleteQuotation = asyncHandler(async (req, res) => {
  const deleted = await RentalQuotation.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Quotation not found");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Quotation deleted successfully"));
});

export const createQuotation = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const {
    productId,
    customerId,
    requestedQuantity,
    charges = {},
    pickupDateTime,
    returnDateTime,
    pricingBreakdown = [],
    totalAmount,
    currency = "INR",
  } = req.body;

  if (
    !productId ||
    !requestedQuantity ||
    !pickupDateTime ||
    !returnDateTime ||
    !totalAmount
  ) {
    throw new ApiError(
      400,
      "Missing required fields: productId, requestedQuantity, pickupDateTime, returnDateTime, totalAmount"
    );
  }
  if (!ObjectId.isValid(productId))
    throw new ApiError(400, "Invalid productId");
  if (customerId && !ObjectId.isValid(customerId))
    throw new ApiError(400, "Invalid customerId");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (!product.ownerId.equals(vendorId))
    throw new ApiError(403, "You are not the owner of this product");

  const from = new Date(pickupDateTime);
  const to = new Date(returnDateTime);
  if (from >= to)
    throw new ApiError(400, "returnDateTime must be after pickupDateTime");

  const quotation = await RentalQuotation.create({
    productId,
    vendorId,
    customerId: customerId || null,
    requestedQuantity,
    charges,
    pickupDateTime: from,
    returnDateTime: to,
    pricingBreakdown,
    totalAmount,
    status: "pending",
  });

  await Notification.create({
    recipientId: req.body.customerId,
    title: "New Quotation Created",
    message: `A new quotation for ${requestedQuantity} units has been created.`,
    type: "quotationCreated",
    payload: { quotationId: quotation._id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, quotation, "Quotation created"));
});

export const getAllQuotations = asyncHandler(async (req, res) => {
  const { vendorId, customerId, productId, status } = req.query;
  const filter = {};
  if (vendorId && ObjectId.isValid(vendorId)) filter.vendorId = vendorId;
  if (customerId && ObjectId.isValid(customerId))
    filter.customerId = customerId;
  if (productId && ObjectId.isValid(productId)) filter.productId = productId;
  if (status) filter.status = status;

  const quotations = await RentalQuotation.find(filter)
    .populate("productId", "productName images baseQuantity")
    .populate("vendorId", "name email")
    .populate("customerId", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, quotations, "Quotations fetched"));
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const quotation = await RentalQuotation.findById(id)
    .populate("productId", "productName images baseQuantity")
    .populate("vendorId", "name email")
    .populate("customerId", "name email");

  if (!quotation) throw new ApiError(404, "Quotation not found");
  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched"));
});

export const updateQuotation = asyncHandler(async (req, res) => {
  const vendorId = req.user._id;
  const { id } = req.params;
  if (!ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");

  const existing = await RentalQuotation.findById(id);
  if (!existing) throw new ApiError(404, "Quotation not found");
  if (!existing.vendorId.equals(vendorId))
    throw new ApiError(403, "Unauthorized");
  if (existing.status !== "pending")
    throw new ApiError(400, "Only pending quotations can be updated");

  const allowed = [
    "requestedQuantity",
    "charges",
    "pickupDateTime",
    "returnDateTime",
    "pricingBreakdown",
    "totalAmount",
    "currency",
  ];
  const payload = {};
  for (const k of allowed)
    if (req.body[k] !== undefined) payload[k] = req.body[k];

  if (payload.pickupDateTime && payload.returnDateTime) {
    if (new Date(payload.pickupDateTime) >= new Date(payload.returnDateTime)) {
      throw new ApiError(400, "returnDateTime must be after pickupDateTime");
    }
  }

  Object.assign(existing, payload);
  await existing.save();
  return res
    .status(200)
    .json(new ApiResponse(200, existing, "Quotation updated"));
});

export const acceptQuotations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { quotationIds } = req.body;

  if (!Array.isArray(quotationIds) || quotationIds.length === 0) {
    throw new ApiError(400, "quotationIds must be a non-empty array");
  }
  for (const qid of quotationIds)
    if (!ObjectId.isValid(qid))
      throw new ApiError(400, `Invalid quotation id ${qid}`);

  const quotations = await RentalQuotation.find({
    _id: { $in: quotationIds },
    status: "pending",
  })
    .populate("productId")
    .lean();

  if (quotations.length !== quotationIds.length)
    throw new ApiError(
      400,
      "One or more quotations are invalid or not pending"
    );

  for (const q of quotations) {
    if (q.customerId && q.customerId.toString() !== userId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to accept one of the quotations"
      );
    }
  }

  const grandTotal = quotations.reduce((s, q) => s + (q.totalAmount || 0), 0);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const q of quotations) {
      const productId = q.productId._id;
      const from = new Date(q.pickupDateTime);
      const to = new Date(q.returnDateTime);
      const qtyRequested = q.requestedQuantity || 1;

      const overlap = await Reservation.aggregate([
        {
          $match: {
            productId: ObjectId(productId),
            status: { $in: ["reserved", "active"] },
            $or: [{ from: { $lt: to }, to: { $gt: from } }],
          },
        },
        { $group: { _id: null, reservedQty: { $sum: "$qty" } } },
      ]).session(session);

      const reservedQty = (overlap[0] && overlap[0].reservedQty) || 0;

      const inv = await Inventory.findOne({ productId: productId }).session(
        session
      );
      if (!inv) {
        throw new ApiError(400, `Inventory not found for product ${productId}`);
      }
      const available = (inv.totalQuantity || 0) - reservedQty;
      if (available < qtyRequested) {
        throw new ApiError(
          400,
          `Insufficient availability for product ${
            q.productId.productName || productId
          }`
        );
      }
    }

    const customerOrder = await new CustomerOrder({
      customerId: userId,
      status: "pending",
      totalAmount: grandTotal,
      currency: quotations[0]?.currency || "INR",
      paymentStatus: "pending",
      rentFrom: new Date(
        Math.min(...quotations.map((q) => new Date(q.pickupDateTime)))
      ),
      rentTo: new Date(
        Math.max(...quotations.map((q) => new Date(q.returnDateTime)))
      ),
    }).save({ session });

    const groups = {};
    for (const q of quotations) {
      const vid = q.vendorId.toString();
      groups[vid] = groups[vid] || [];
      groups[vid].push(q);
    }

    const createdRentalOrders = [];
    const createdLines = [];
    const createdReservations = [];

    for (const [vendorId, qList] of Object.entries(groups)) {
      const vendorTotal = qList.reduce((s, q) => s + (q.totalAmount || 0), 0);
      const rentalOrder = await new RentalOrder({
        customerOrderId: customerOrder._id,
        vendorId,
        status: "pending",
        totalAmount: vendorTotal,
      }).save({ session });

      createdRentalOrders.push(rentalOrder);

      for (const q of qList) {
        const productSnapshot = {
          productId: q.productId._id,
          name: q.productId.productName,
          images: q.productId.images || [],
          basePrice: q.productId.baseQuantity,
        };

        const line = await new RentalOrderLine({
          rentalOrderId: rentalOrder._id,
          productId: q.productId._id,
          productSnapshot,
          quantity: q.requestedQuantity || 1,
          from: new Date(q.pickupDateTime),
          to: new Date(q.returnDateTime),
          unitPrice: Math.round(
            (q.totalAmount || 0) / (q.requestedQuantity || 1)
          ),
          extras: q.charges || [],
          lineTotal: q.totalAmount || 0,
          quotationId: q._id,
          status: "reserved",
        }).save({ session });

        createdLines.push(line);

        const reservation = await new Reservation({
          productId: q.productId._id,
          customerOrderId: customerOrder._id,
          rentalOrderId: rentalOrder._id,
          quotationId: q._id,
          qunatity: q.requestedQuantity || 1,
          from: new Date(q.pickupDateTime),
          to: new Date(q.returnDateTime),
          status: "reserved",
        }).save({ session });

        createdReservations.push(reservation);

        await Inventory.findOneAndUpdate(
          { productId: q.productId._id },
          {
            $inc: {
              reservedQuantity: q.requestedQuantity || 1,
              availableQuantity: -(q.requestedQuantity || 1),
            },
          },
          { session }
        );
      }
    }

    await RentalQuotation.updateMany(
      { _id: { $in: quotationIds } },
      { $set: { status: "accepted" } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const result = {
      customerOrder,
      rentalOrders: createdRentalOrders,
      lines: createdLines,
      reservations: createdReservations,
    };

    return res
      .status(201)
      .json(
        new ApiResponse(201, result, "Quotations accepted and orders created")
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});
