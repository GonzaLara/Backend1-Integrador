const express = require('express');
const router = express.Router();
const User = require('../models/users.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Product = require('../models/product.js');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/public/img');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
})

var subir = multer({
    storage: storage,
}).single("image");

//insertar un usuario en la base de datos
router.post('/add', subir, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo", type: 'danger' });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });

    try {
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'Usuario agregado correctamente.'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('index', {
            title: 'Pagina Principal',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: "Agregar Usuario" })
});

//Editar un usuario
router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect('/');
        }
        res.render('edit_users', {
            title: "Editar Usuario",
            user: user,
        });
    } catch (err) {
        res.redirect('/');
    }
});


// Actualizar un usuario 
router.post('/update/:id', subir, async (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;

        try {
            const old_image_path = path.resolve('./src/public/img', req.body.old_image);
            if (fs.existsSync(old_image_path)) {
                fs.unlinkSync(old_image_path); 
            }
        } catch (err) {
            console.error('Error al eliminar la imagen anterior:', err.message);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'Usuario actualizado correctamente.'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const result = await User.findByIdAndDelete(id);

        if (result && result.image) {
            const imagePath = path.resolve('./src/public/img', result.image);
            try {
                fs.unlinkSync(imagePath);
            } catch (err) {
                console.error('Error al eliminar la imagen:', err.message);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'Usuario eliminado correctamente.'
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message });
    }
});


// PRODUCTOS
// Obtener todos los productos
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('products', {
            title: 'Productos',
            products: products,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});

//Agregar producto al carrito
router.post('/add-to-cart', async (req, res) => {
    const { productId, quantity } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const existingProduct = req.session.cart.find(item => item.productId === productId);
    
    if (existingProduct) {
        existingProduct.quantity += quantity;
    } else {
        req.session.cart.push({ productId, quantity });
    }

    res.json({ message: 'Producto agregado al carrito correctamente.' });
});

// CARRITO
// Mostrar el carrito
router.get('/cart', async (req, res) => {
    try {
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const productIds = req.session.cart.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        const cartProducts = req.session.cart.map(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            
            if (product) {
                return {
                    ...product.toObject(),
                    quantity: item.quantity
                };
            } else {
                console.error(`Producto con ID ${item.productId} no encontrado en la base de datos.`);
                return null;
            }
        }).filter(product => product !== null);

        res.render('cart', {
            title: 'Carrito',
            products: cartProducts,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


module.exports = router;