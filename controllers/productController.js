const { date } = require("joi");
const ProductService = require("../services/product.service");
const TypeProductModel = require("../models/type_product"); 
const { message, error } = require("../validation/productValidator");



const {
  productSchema,
} = require("../validation/productValidator");


class ProductController {
    static getProducts = async (req, res, next) => {
        try {
            const products = await ProductService.getProducts(
                req.user.id,
                req.query.page,
                req.query.limit
            );
            res.status(200).json({
                message: "Lấy tất cả sản phẩm thành công",
                success: true, data: products,
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    static getProductById = async (req, res) => {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            }
            return res.status(200).json({
                message: 'Lấy sản phẩm thành công',
                success: true, data: product,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    // Thời Trang
    static createProductFashion = async (req, res) => {
        try {
            const { error } = productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const {
                name, code, short_desc, desc_product,
                category_id, size, color, file_attachments,
                quantity_by_key_value } = req.body;
            
            const metadata = {
                sizes: size,
                colors: color,
            };
            const savedProduct= await ProductService.createProductFashion(
                name,
                code,
                short_desc,
                desc_product,
                category_id,
                metadata,
                file_attachments,
                quantity_by_key_value,
                req.user.id,
            );
            res.status(201).json({
                message: "Tạo sản phẩm thành công",
                success: true, product: savedProduct,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Thức Ăn
    static createProductFood = async (req, res) => {
        try {
            const { error } = productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const { name, code, short_desc, desc_product, number_inventory_product,
                category_id, size, type, file_attachments,quantity_by_key_value } = req.body;
            const metadata = {
                sizes: size,
                types: type
            };
            const savedProduct = await ProductService.createProductfood(
                name,
                code,
                short_desc,
                desc_product,
                number_inventory_product,
                category_id,
                metadata,
                file_attachments,
                quantity_by_key_value,
                req.user.id
            );
            res.status(201).json({
                message: "Tạo sản phẩm thành công",
                success: true, data: savedProduct
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Điện Thoại
    static createProductPhone = async (req, res) => {
        try {
            const { error } = productSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            const { name, code, short_desc, desc_product,
                number_inventory_product, category_id,
                memory, color, file_attachments, quantity_by_key_value } = req.body;
            const metadata = {
                memorys: memory,
                colors: color,
            };
            const savedProduct = await ProductService.createProductphone(
                name,
                code,
                short_desc,
                desc_product,
                number_inventory_product,
                category_id,
                metadata,
                file_attachments,
                quantity_by_key_value,
                req.user.id
            );
            res.status(201).json({
                message: "Tạo sản phẩm thành công",
                success: true, data: savedProduct
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static updateProduct = async (req, res) => {
        try {
            const updatedProduct = await ProductService.updateProduct(
                req.params.id,
                req.body.name,
                req.body.code,
                req.body.short_desc,
                req.body.desc_product,
                req.body.number_inventory_product,
                req.body.category_id,
                req.body.key,
                req.body.value,
                req.body.file_url,
                req.body.file_type,
                req.user.id
            );
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Cập nhật sản phẩm không thành công' });
            }
            return res.status(200).json({
                message: "Cập nhật sản phẩm thành công!",
                success: true, data: updatedProduct,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static deleteProduct = async (req, res) => {
        try {
            const deletedProduct = await ProductService.deleteProduct(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({ message: 'Xóa sản phẩm không thành công' });
            }
            return res.status(200).json({
                message: "Xóa sản phẩm thành công!",
                success: true, product: deletedProduct,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static getAllTypeProducts = async (req, res) => {
        try {
            const type_Products = await TypeProductModel.find();
            res.status(200).json({
                message: "Lấy tất cả loại sản phẩm thành công",
                success: true,
                data: type_Products
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}

module.exports = ProductController;
