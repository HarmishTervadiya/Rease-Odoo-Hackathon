import { Router } from "express";
import {
  addProduct,
  changeProductCategory,
  decreaseProductQuantity,
  increaseProductQuantity,
  updateProductDetails,
  updateProductImages,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByVendor
} from "../controller/product.controller.js";
import { verifyUser, verifyVendor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/all").get(getAllProducts);
router.route("/:productId").get(getProductById);
router.route("/category/:categoryId").get(getProductsByCategory);
router.route("/vendor/:ownerId").get(getProductsByVendor);

router
  .route("/addProduct")
  .post(verifyVendor, upload.array("productImgs"), addProduct);

router.route("/updateProductDetails").patch(verifyVendor, updateProductDetails);

router
  .route("/increaseProductQuantity")
  .patch(verifyVendor, increaseProductQuantity);

router
  .route("/decreaseProductQuantity")
  .patch(verifyVendor, decreaseProductQuantity);

router
  .route("/changeProductCategory")
  .patch(verifyVendor, changeProductCategory);

router
  .route("/updateProductImages")
  .post(verifyVendor, upload.array("newImages"), updateProductImages);

export default router;
