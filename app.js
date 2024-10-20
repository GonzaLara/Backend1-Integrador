import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import routes from './src/routes/routes.js';
import __dirname from './utils.js';
import { engine } from 'express-handlebars';
import Handlebars from 'handlebars';

Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
});

Handlebars.registerHelper('lt', function (a, b) {
    return a < b;
});

Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
});

Handlebars.registerHelper('range', (start, end) => {
    const result = [];
    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
});

Handlebars.registerHelper('dec', function (value) {
    return value - 1;
});

Handlebars.registerHelper('inc', function (value) {
    return value + 1;
});

const app = express();
const PORT = 8080;

// Configurar para trabajar con JSON 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar las variables de entorno
dotenv.config();
const URIConexion = process.env.DB_URI;

// Conexion a la base de datos
mongoose.connect(URIConexion)
    .then( () => console.log('Conectado a la base de datos MongoDB Atlas.'))
    .catch((error) => console.error('Error en conexion:', error))
;

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine({
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));

Handlebars.registerHelper('multiply', function(quantity, price) {
    const n1 = Number(quantity);
    const n2 = Number(price);

    if (!isNaN(n1) && !isNaN(n2)) {
        return (n1 * n2).toFixed(2);
    }
    return '0.00';
});

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));

// Setear de manera estatica la carpeta public
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Configuracion de sesiones
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