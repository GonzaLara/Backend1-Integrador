require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a la base de datos
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log("Conectado a la base de datos."));

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(express.json());

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

app.use(express.static('./src/public/img'));

//template engine
app.set('view engine', 'ejs');
app.set('views', './src/views');

//route prefix
app.use("", require('./src/routes/routes.js'))


app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
