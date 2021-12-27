const productModel = require("../db/models/Product");
const userModel = require("../db/models/User");
const validation = require("../validations/product");

function createProduct() {
    return async function(req, res) {
        const {
            description,
            quantity,
            valueUnitary
        } = req.body;

        if (!description || 
            !quantity ||
            !valueUnitary
        ) {
            return res.status(422).json({
                error: "Description, quantity and valueUnitary are required"
            });
        }

        if (!validation.description(description.trim())) {
            return res.status(422).json({
                error: "Description invalid"
            });
        }

        if (!validation.quantity(quantity)) {
            return res.status(422).json({
                error: "Quantity invalid, inform only numbers"
            });
        }

        if (!validation.valueUnitary(valueUnitary)) {
            return res.status(422).json({
                error: "Value unitary invalid, inform only numbers and points"
            });
        }

        const id_user = req.user.id_user;
        const product = { description, quantity, valueUnitary, id_user }

        try {
            const createdProduct = await productModel.create(product);
            
            return res.status(201).json({
                message: "Product created successfully",
                id_product: createdProduct._id
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                error: "Failed create product"
            });
        }
    }
}

function getProducts() {
    return async function(req, res) {
        try {
            const products = await productModel.find({ id_user: req.user.id_user });
            
            if (!products) {
                return res.status(400).json({ error: "No registered products" });
            }

            return res.status(200).json(products);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed operation" });
        }
    }
}

function getProductById() {
    return async function(req, res) {
        const { id_user } = req.user;
        const { id } = req.params; // ID do produto

        if (!id) {
            return res.status(422).json({ error: "ID product is required" });
        }

        try {
            const product = await productModel.findOne({ _id: id, id_user });

            if (!product) {
                return res.status(400).json({ error: "Product not found" });
            }

            return res.status(200).json(product);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Failed operation" });
        }
    }
}

function updateProduct() {
    return async function(req, res) {
        const { id_user } = req.user;
        const { id } = req.params; // ID do produto
        const {
            description,
            quantity,
            valueUnitary
        } = req.body;

        if (!id) {
            return res.status(422).json({ error: "ID product is required" });
        }

        if (!description || !validation.description(description.trim())) {
            return res.status(422).json({
                error: "Description invalid"
            });
        }

        if (!validation.quantity(quantity)) {
            return res.status(422).json({
                error: "Quantity invalid, inform only numbers"
            });
        }

        if (!validation.valueUnitary(valueUnitary)) {
            return res.status(422).json({
                error: "Value unitary invalid, inform only numbers and points"
            });
        }

        let productID;
        try {
            productID = await productModel.findOne({ _id: id, id_user });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Product not found" });
        }
        
        if (!productID) {
            return res.status(422).json({ error: "Product not found" });
        }

        const product = { description, quantity, valueUnitary, id_user }

        try {
            const updatedProduct = await productModel.updateOne({ _id: id, id_user }, product);

            if (updatedProduct.matchedCount === 0) {
                return res.status(422).json({ error: "Failed update product" });
            }

            return res.status(200).json({
                message: "Product updated successfully",
                product
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Operation failed" });
        }
    }
}

function deleteProduct() {
    return async function(req, res) {
        const { id_user } = req.user;
        const { id } = req.params; // ID do produto

        if (!id) {
            return res.status(422).json({ error: "ID product is required" });
        }

        try {
            const productID = await productModel.findOne({ _id: id, id_user });

            if (!productID) {
                return res.status(422).json({ error: "Product not found" });
            }

            const deletedProduct = await productModel.deleteOne({ _id: id, id_user });

            if (deletedProduct.deletedCount == 0) {
                return res.status(400).json({ error: "Failed delete product" });
            }

            return res.status(200).json({ message: "Product deleted successfully" });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Product not found" });
        }
    }
}

function getProductsAllUsers() {
    return async function(req, res) {
        try {
            const products = await productModel.find();
            const users = await userModel.find();

            if (!products) {
                return res.status(422).json({ error: "No registered products" });
            }

            const productsWithNameUser = products.map(prod => {
                const user = users.find(el => prod.id_user == el._id);
                return { 
                    _id: prod._id, 
                    description: prod.description,
                    quantity: prod.quantity,
                    valueUnitary: prod.valueUnitary,
                    id_user: prod.id_user,
                    nameUser: user.name 
                }
            });

            return res.status(200).json(productsWithNameUser);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Request failed" });
        }
    }
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsAllUsers
}