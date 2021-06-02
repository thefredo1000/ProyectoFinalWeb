const express = require('express');
const app = express();
const fs = require('fs');
var cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require("bcryptjs");
app.use(cors());
const jwt = require('jsonwebtoken');



app.use(express.json()); // body-parser
const ejs = require('ejs');

require('./src/database');
let ProductModel = require('./src/models/products');

app.route('/products/create').get((req, res) =>{
    res.sendFile('insert.html', {root: './src/pages/'});
});

app.route('/products/create').post((req, res) =>{
    let{ name, brand,  price } = req.body; // JS object deconstruction
    
    let product = new ProductModel({name: name, brand: brand, price: price});
    product.save((err) => {
        if (err) res.status(503).send(`error: ${err}`); 
        else res.send(product);
    });
});

app.route('/products/all').get((req, res) => {
    res.sendFile('shoppingList.html', {root: './src/pages/'});
});

app.route('/products').get(async (req, res) => {
    let allproducts = await ProductModel.find();
    res.send(allproducts);
});

app.route('/products/:id').get(async (req, res) => {
    let productId  = req.params.id;
    let product = await ProductModel.findOne({_id: productId});
    if (product)
        res.send(product);
    else
        res.status(404).end(`product with id ${productId} does not exist`)
});

app.route('/products/:id').put((req, res) => {
    let productId  = req.params.id;
    let{ name, brand, price } = req.body;
    ProductModel.findOneAndUpdate(
        {_id: productId}, // selection criteria
        {
            name: name,
            brand: brand,
            price: price,
        }
    )
    .then(product => res.send(product))
    .catch(err => { console.log(error); res.status(503).end(`Could not update product ${error}`); });
});

app.route('/products/:id').delete((req, res) => {
    let productId  = req.params.id;
    ProductModel.findOneAndDelete({_id: productId})
    .then(product => res.send(product))
    .catch(err => { console.log(error); res.status(503).end(`Could not delete product ${error}`); });
});

app.route('/products/:id/edit').get((req, res) => {
    let productId  = req.params.id;

    // load the movie as string, leaver some markers and replace the markers with the info you need
    // create the page from scratch dynamically

    ejs.renderFile('./src/pages/edit.html', {productId: productId}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });
});





const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage});

function createAdmin(){
    

    avatarObject = {

        
        data: fs.readFileSync( './uploads/admin.jpg'),
        contentType: 'image/jpg'
    };
    
    let user = new UsersModel({username: "admin", email : "admin@gmail.com", password: "admin", role: "admin", avatar:avatarObject});

    user.save();

}

let UsersModel = require('./src/models/users');
createAdmin();



app.route('/users/create').get( (req, res) =>{
    res.sendFile('registerPage.html', {root: './src/pages/'});
});

app.post('/users/create', upload.single('avatar'), (req, res) => {

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    console.log(req.file.filename);
    avatarObject = {

        
        data: fs.readFileSync( './uploads/' + req.file.filename),
        contentType: 'image/jpg'
    };
    
    let user = new UsersModel({username: username, email:email, password: password, role: "Client", avatar:avatarObject});

    user.save((err) => {

        if (err) res.status(503).send(`error: ${err}`); 
        else res.status(200).send(user);
    });

});


app.route('/users/all').get((req, res) => {
    res.sendFile('usersList.html', {root: './src/pages/'});
});

app.route('/users').get(async (req, res) => {
    let allUsers = await UsersModel.find();

    // create an empty array
    let modifiedUsers = []

    allUsers.forEach(u => {
        modifiedUsers.push({
            _id: u._id, 
            username: u.username, 
            email: u.email,
            role: u.role,
            password: u.password,
            avatar: {
                contentType: u.avatar.contentType, 
                data: u.avatar.data.toString('base64')
            }
        });
    });

    res.send(modifiedUsers);
    
});


app.route('/users/:id/edit').get((req, res) => {
    let userId  = req.params.id;


    ejs.renderFile('./src/pages/editUser.html', {userId: userId}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });
});

app.route('/users/:id').get(async (req, res) => {
    let userId  = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    if (user)
        res.send({
            _id: user._id, 
            username: user.username, 
            email: user.email,
            password: user.password,
            avatar: {
                contentType: user.avatar.contentType,
                data: user.avatar.data.toString('base64')
            }
        });
    else
        res.status(404).end(`User with id ${userId} does not exist`)
});

app.put('/users/:id', upload.single('avatar'), async (req, res) => {
    let userId = req.params.id;
    let user = await UsersModel.findOne({_id: userId});
    user.username = req.body.username;
    user.email = req.body.email;
    user.password = req.body.password;

    if (req.file){
        console.log('User modified the avatar');
        avatarObject = {
            data: fs.readFileSync('./uploads/' + req.file.filename),
            contentType: 'image/jpg'
        };
        user.avatar = avatarObject;
    }

    user.save()
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not update user ${error}`); });
});

app.route('/users/:id').delete((req, res) => {
    let userId  = req.params.id;
    UsersModel.findOneAndDelete({_id: userId})
    .then(user => res.send(user))
    .catch(err => { console.log(error); res.status(503).end(`Could not delete user ${error}`); });
});


app.route('/users/checkout').post((req, res) => {


    console.log(req.body);

    ejs.renderFile('./src/pages/checkout.html', {username: req.body.username, products: req.body.products}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });

});

const secret = "5tr0n6P@55W0rD";

function generateToken(user) {
    let payload = {
     username: user.username,
     id: user.id,
     role: user.role
    };
    let oneDay = 60 * 60 * 24;
    return token = jwt.sign(payload, secret, { expiresIn: oneDay });
}

function requireLogin(req, res, next){
    let accessToken = req.cookies.authorization
    // if there is no token stored in cookies, the request is unauthorized
    if (!accessToken){ 
        console.log('Unauthorized user, redirecting to login'); 
        return res.redirect('/login'); 
    }

    try{
        // use the jwt.verify method to verify the access token, itthrows an error if the token has expired or has a invalid signature
        payload = jwt.verify(accessToken, secret)
        console.log('Logged user accessing the site ' + payload.username);
        req.user = payload; // you can retrieve further details from the database. Here I am just taking the name to render it wherever it is needed.
        next()
    }
    catch(e){
        //if an error occured return request unauthorized error, or redirect to login
        // return res.status(401).send():
        res.redirect(403, '/login');
    }
}


app.route('/login').get( (req, res) =>{
    res.sendFile('loginPage.html', {root: './src/pages/'});
});

app.route('/login/').post(async (req, res) => {
    let {username, password} = req.body;
    let user = await UsersModel.findOne({username: username});
    if (user){
        let success = bcrypt.compareSync(req.body.password, user.password);
        if (success === true){
            const accessToken = generateToken(user);
            res.cookie("authorization", accessToken, {secure: true, httpOnly: true});
            res.status(200).json(accessToken);
        }
        else{
            res.status(404).send('Invalid credentials');
        }
            
    }
    else{
        res.status(404).send('Invalid credentials');
    }
    
});


app.get('/', requireLogin, function (req, res) {
    ejs.renderFile('./src/pages/shoppingList.html', {user: req.user}, null, function(err, str){
        if (err) res.status(503).send(`error when rendering the view: ${err}`); 
        else {
            res.end(str);
        }
    });
});

app.post('/logout', requireLogin, function(req, res){
    console.log(`Logging out ${req.username}`)
    res.clearCookie('authorization');
    res.send('User logged out');
});


const portNumber = 3000;
var server = app.listen(portNumber, function(){
    console.log('Express Server ready and running');
});

