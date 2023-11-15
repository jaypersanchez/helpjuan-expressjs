const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const connectToDatabase = require('./db')

const User = require('./models/user'); 


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB using Mongoose
// Connect to MongoDB
connectToDatabase();

// Replace this with your actual secret key. It should be kept secret.
const secretKey = 'yourSecretKey';
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

app.get('/protected', (req, res) => {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.userId;
  
      // You can now use the user ID to fetch user-specific data from the database
      // For this example, we'll just return a message.
      res.json({ message: `Protected data for user with ID ${userId}` });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
});

// Post route methods
app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username already exists
    if (users.some((user) => user.username === username)) {
      return res.status(400).json({ message: 'Username already taken' });
    }
  
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password with a salt round of 10
  
    const user = {
      id: users.length + 1,
      username,
      password: hashedPassword,
    };
  
    users.push(user);
  
    res.status(201).json({ message: 'User registered successfully' });
  });
  
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username exists
    const user = users.find((u) => u.username === username);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Verify the password
    if (bcrypt.compareSync(password, user.password)) {
      // Passwords match, generate a JWT
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });

app.post('/post-users', (req, res) => {
    // Handle the GET request for the "users" route
    // You can return data or perform other actions here
});
 
//this function will also be used to register new accounts and update profiles
app.post('/post-profile', async (req, res) => {

  try {
      // Retrieve data from the request body
      const { email, firstName, lastName, mobile, password } = req.body;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create a new user instance
      const newUser = new User({
        email,
        firstName,
        lastName,
        mobile,
        password: hashedPassword, // Save the hashed password
      });

      // Save the user to the database
      await newUser.save();

      // Perform actions with the received data
      console.log('Received data:', { email, firstName, lastName, mobile, hashedPassword });
      

      return res.status(200).json({ message: 'success', email: email });
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
