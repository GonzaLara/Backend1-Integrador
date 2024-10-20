import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import User from '../models/users.js';
import Product from '../models/product.js';
import __dirname from '../../utils.js';

const router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'src/public/img'));
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});


var subir = multer({
    storage: storage,
}).single("image");

// USUARIOS
// Insertar un usuario en la base de datos
router.post('/add', subir, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningun archivo", type: 'danger' });
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
        const usersWithIndex = users.map((user, index) => ({
            ...user.toObject(),
            displayIndex: index + 1
        }));
        res.render('index', {
            title: 'Pagina Principal',
            users: usersWithIndex,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});


router.get('/add', (req, res) => {
    res.render('add_users', { title: "Agregar Usuario" })
});

// Editar un usuario
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
            const old_image_path = path.join(__dirname, 'src/public/img', req.body.old_image);
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

// Eliminar un usuario 
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const result = await User.findByIdAndDelete(id);

        if (result && result.image) {
            const imagePath = path.join(__dirname, 'src/public/img', result.image);
            console.log(`Intentando eliminar la imagen en: ${imagePath}`);
            
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                    console.log('Imagen eliminada correctamente.');
                } catch (err) {
                    console.error('Error al eliminar la imagen:', err.message);
                }
            } else {
                console.error(`El archivo no existe en la ruta: ${imagePath}`);
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
// Obtener los productos
router.get('/products', async (req, res) => {
    const { page = 1, limit = 6 } = req.query;

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
        };

        const result = await Product.paginate({}, options);
        
        res.render('products', {
            title: 'Productos',
            products: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            limit: result.limit
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

    res.json({ message: 'Producto agregado al carrito.' });
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
                console.error(`Producto con id ${item.productId} no encontrado en la base de datos.`);
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


// Eliminar unidad de un producto del carrito
router.post('/remove-one', async (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    const productIndex = req.session.cart.findIndex(item => item.productId === productId);

    if (productIndex !== -1) {
        if (req.session.cart[productIndex].quantity > 1) {
            req.session.cart[productIndex].quantity -= 1;
        } else {
            req.session.cart.splice(productIndex, 1);
        }
    }

    res.sendStatus(204);
});

// Eliminar todas las unidades de un producto del carrito
router.post('/remove-all', async (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    req.session.cart = req.session.cart.filter(item => item.productId !== productId);

    res.sendStatus(204);
});

export default router; 