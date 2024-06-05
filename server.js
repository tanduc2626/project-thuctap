const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');

const app = express();
const port = 3000;

// HTTP logger
app.use(morgan('combined'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Template engine
app.engine('hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

// Mock data
const products = [
    { name: 'Product 1', price: 100 },
    { name: 'Product 2', price: 200 },
    { name: 'Product 3', price: 300 },
];

// Routes
app.get('/', (req, res) => {
    res.render('home', { 
        title: 'Home Page',
        products: products 
    });
});

app.get('/product/:name', (req, res) => {
    const product = products.find(p => p.name === req.params.name);
    if (product) {
        res.render('product', { 
            title: 'Product Details',
            product: product 
        });
    } else {
        res.status(404).send('Product not found');
    }
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
