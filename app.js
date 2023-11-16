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
app.get('/get-users', async (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});
  
app.get('/get-profile', async (req, res) => {
  try {
    const { email, id } = req.query;

    // Add your logic to fetch the user profile based on the provided email or id
    // For example, using Mongoose:
    const user = await User.findOne({ $or: [{ email }, { _id: id }] }, { email: 1, firstName: 1, lastName: 1, mobile: 1 });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user profile
    return res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
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

  app.post('/update-profile', async (req, res) => {
      try {
        const { email, id, firstName, lastName, mobile } = req.body;

        // Find the user by email or ID
        const user = await User.findOne({ $or: [{ email }, { _id: id }] });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Update the user fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (mobile) user.mobile = mobile;

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'Profile updated successfully', user });

      }
      catch(error) {
        console.error('Error:', error);
        return res.status(500).json({ message: "failed", error: 'Internal Server Error' });
      }
  })

  app.post('/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Check if the user with the given email exists in the database
        const existingUser = await User.findOne({ email });
        console.log(`Authenticate ${existingUser.email}::${password}`)
        if (!existingUser) {
          return res.status(200).json({ message: "failed", error: 'User not found' });
        }
            
        // Verify the password
        bcrypt.compare(password, existingUser.password, (err, data) => {
            //if error than throw error
            if (err) {
              console.log(`error already`)
              throw err
            }

            //if both match than you can do anything
            if (data) {
                // Passwords match, generate a JWT
                const token = jwt.sign({ userId: existingUser.id }, secretKey, { expiresIn: '24h' });
                return res.status(200).json({ message:true, token: token, email: existingUser.email, id: existingUser._id })
            } //else {
                //return res.status(200).json({ message: data, error: "Invalid credential" })
            //}
        })
    }
    catch(error) {
      console.error('Error:', error);
      return res.status(500).json({ message: "failed", error: 'Internal Server Error' });
    }
  });

 
//this function will also be used to register new accounts and update profiles
app.post('/new-account', async (req, res) => {

  try {
      // Retrieve data from the request body
      //const { email, firstName, lastName, mobile, password } = req.body;
      const { email, password } = req.body;
      // Check if the user with the given email exists in the database
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(200).json({ message: "failed", error: 'Email already exist' });
      }

      // Hash the password
      //const hashedPassword = await bcrypt.hashSync(password, 10);
      // Create a new user instance
      const newUser = new User({
        email,
        password: password, // Save the hashed password
      });

      // Save the user to the database
      await newUser.save();
      
      // Perform actions with the received data
      console.log('Received data:', { email, password });
      const token = jwt.sign({ userId: newUser.id }, secretKey, { expiresIn: '24h' });
            
      return res.status(200).json({ message: 'success', token: token, email: email, id: newUser.id });
  }
  catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ message: "failed", error: 'Internal Server Error' });
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
