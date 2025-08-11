import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.Types.ObjectId;

const customerOrderSchema = new Schema({
  customerId: { 
    type: ObjectId, 
    ref: "User", 
    required: true, 
    index: true },
  status: { 
    type: String, 
    enum: ["draft", "paid", "completed", "cancelled"], 
    default: "draft", 
    index: true
 },
  totalAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "paid", "refunded"], 
    default: "pending"
 },
//   paymentRef: { type: String },
  rentFrom: Date,
  rentTo: Date,
  meta: Schema.Types.Mixed
}, { timestamps: true });

customerOrderSchema.index({ customerId: 1, createdAt: -1 });

export const CustomerOrder = mongoose.model("CustomerOrder", customerOrderSchema);