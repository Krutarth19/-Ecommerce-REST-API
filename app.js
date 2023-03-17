const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser =require("body-parser");
const mongoose =require("mongoose");


const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/order");
const UserRoutes =require("./api/routes/user")

mongoose.connect("mongodb+srv://krutarth2023:"+ process.env.MONGO_ATLAS_PASSW+"@cluster0.xd7lj7k.mongodb.net/?retryWrites=true&w=majority")

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Headers for access TO avoid cors errors
// * denotes that access by everywhere
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type,Accept,Authorization');
    if(req.method === 'OPTIONS'){
        req.header('Access-Control-Allow-,Methods','PUT,POST,DELETE,PATCH,GET');
        return res.status(200).json({});
    }
    next();
});

// Routes For Handle Request
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', UserRoutes);


// Handling Error routes
app.use((req, res, next) => {
    const error = new Error("Not Found!");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})


module.exports = app;