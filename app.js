const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const connectToDatabase = require('./db')
const jwt = require('jsonwebtoken');
require('dotenv').config();


const User = require('./models/user'); 


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB using Mongoose
// Connect to MongoDB
connectToDatabase();

// Replace this with your actual secret key. It should be kept secret.
const secretKey = process.env.SECRET_KEY
// Sample user data (usually, you'd retrieve this from a database)
const users = [];

// Get route methods
app.get('/get-users', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});
  
app.get('/get-profile', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.get('/get-postads', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.get('/get-search', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.get('/get-messages', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.get('/get-settings', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});


  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // Check if the user with the given email exists in the database
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "failed", error: 'User not found' });
    }
        
    // Verify the password
    bcrypt.compare(req.body.password, existingUser.password, (err, data) => {
        //if error than throw error
        if (err) throw err

        //if both match than you can do anything
        if (data) {
            // Passwords match, generate a JWT
            const token = jwt.sign({ userId: existingUser.id }, secretKey, { expiresIn: '24h' });
            return res.status(200).json({ data:data, token: token })
        } else {
            return res.status(401).json({ data: data, msg: "Invalid credencial" })
        }
    })
  });

 
//this function will also be used to register new accounts and update profiles
app.post('/new-account', async (req, res) => {

  try {
      // Retrieve data from the request body
      const { email, firstName, lastName, mobile, password } = req.body;
      
      // Check if the user with the given email exists in the database
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(404).json({ message: "failed", error: 'Email already exist' });
      }

      // Hash the password
      //const hashedPassword = await bcrypt.hashSync(password, 10);
      // Create a new user instance
      const newUser = new User({
        email,
        firstName,
        lastName,
        mobile,
        password: password, // Save the hashed password
      });

      // Save the user to the database
      await newUser.save();
      
      // Perform actions with the received data
      console.log('Received data:', { email, firstName, lastName, mobile, password });
      const token = jwt.sign({ userId: newUser.id }, secretKey, { expiresIn: '24h' });
            
      return res.status(200).json({ message: 'success', email: email, token: token });
  }
  catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
  

app.post('/post-postads', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.post('/post-search', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.post('/post-messages', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

app.post('/post-settings', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
