import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import routes from './src/routes/routes.js';
import __dirname from './utils.js';

const app = express();
const PORT = process.env.PORT || 4000;

//configurar para trabajar con JSON 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Para poder trabajar con las variables de entorno
dotenv.config();

// Leer y almacenar variables de entorno
const URIConexion = process.env.DB_URI;

// Conexion a la base de datos
mongoose.connect(URIConexion)
    .then( () => console.log('Conectado a la base de datos.'))
    .catch((error) => console.error('Error en conexion:', error))
;

/**
 * Para indicar en que parte del proyecto van a estar las vistas
 * Utilizar rutas absolutas para indicar y evitar asuntos de ruteo relativo
 */
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Setear de manera estatica la carpeta public
app.use(express.static(path.join(__dirname, 'src', 'public', 'img')));

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Route prefix
app.use("", routes);

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
