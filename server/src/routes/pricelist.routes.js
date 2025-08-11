import { Router } from "express";
import { addPriceList, getPriceListsByProduct, updatePriceList, deletePriceList } from "../controllers/pricelist.controller.js";
import { verifyVendor } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/add").post(verifyVendor, addPriceList);
router.route("/product/:productId").get(getPriceListsByProduct);
router.route("/:priceListId").patch(verifyVendor, updatePriceList);
router.route("/:priceListId").delete(verifyVendor, deletePriceList);

export default router;
