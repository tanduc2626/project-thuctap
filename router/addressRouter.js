const addressController = require("../controllers/addressController");
const verify = require("../middleware/verifyToken");
const router = require("express").Router();
// router.get("/", verify.verityToken, addressController.showAddress);
router.post("/", verify.verityToken, addressController.addAddress);
router.put("/:id", verify.verityToken, addressController.updateAddress);
router.get("/", verify.verityToken, addressController.getAddress);
router.delete("/:id", verify.verityToken, addressController.deleteAddress);
module.exports = router;
