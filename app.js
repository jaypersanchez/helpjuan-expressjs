const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const connectToDatabase = require('./db')
const jwt = require('jsonwebtoken');
require('dotenv').config();


const User = require('./models/user'); 
const JobAd = require('./models/jobAdSchema');


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

//return only job posted by other and not by the current user
app.post('/get-postads', async (req, res) => {
  try {
    // Assuming you have the current user's ID from the request
    const currentUserID = req.body.userid;  // Adjust this based on how user information is stored in your app
    
    // Retrieve job posts created by others (excluding the current user)
    const jobAds = await JobAd.find({ userid: { $ne: currentUserID } });
    console.log(`get-postads ${jobAds}`)

    res.status(200).json(jobAds);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'failed', error: 'Internal Server Error' });
  }
});

// Endpoint to get all bidders based on userid
app.get('/job/:jobId/bidders', async (req, res) => {
  try {
    const { userId } = req.query; // Assuming userId is passed as a query parameter
    const { jobId } = req.params;
    
    // Fetch the job ad with specified jobId and check if it belongs to the user
    const jobAd = await JobAd.findOne({ _id: jobId, userid: userId })
    if (!jobAd) {
      return res.status(404).json({ message: 'Job ad not found for the specified user.' });
    }
    else {
        // Extract and return the bidders information
        // Extract and return the bidders information
        const bidders = await Promise.all(jobAd.bids.map(async (bid) => {
          const bidderUser = await User.findOne({ _id: bid.bidderId });
          return {
            jobbidid: bid._id,
            bidderId: bid.bidderId,
            bidderName: bidderUser ? `${bidderUser.firstName} ${bidderUser.lastName}` : "Unknown Bidder",
            bidAmount: bid.bidAmount,
            bidTime: bid.bidTime,
            rewarded: bid.rewarded,
          };
        }));
        // Now you have an array of bidder details
        console.log('Bidders:', bidders);
        // Send the details back to the client
        res.status(200).json(bidders);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to get all JobAds for a specific userid
app.get('/jobads/:userid', async (req, res) => {
  const { userid } = req.params;

  try {
    // Find all JobAds that match the provided userid
    const jobAds = await JobAd.find({ userid });

    if (!jobAds || jobAds.length === 0) {
      return res.status(404).json({ message: 'No JobAds found for the given userid.' });
    }

    res.status(200).json(jobAds);
  } catch (error) {
    console.error('Error fetching JobAds:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//post messages from the bidder 
app.post('/job/:jobId/bid/:bidId/bidder-message', async (req, res) => {
  const { jobId, bidId } = req.params;
  const { senderId, receiverId, message } = req.body;

  try {
    const jobAd = await JobAd.findOne({ _id: jobId, 'bids.bidderId': bidId });

    if (!jobAd) {
      return res.status(404).json({ message: 'Job or bid not found.' });
    }

    const bidIndex = jobAd.bids.findIndex((bid) => bid.bidderId === bidId);
    const newMessage = {
      senderId,
      receiverId,
      message,
    };

    jobAd.bids[bidIndex].messages.push(newMessage);
    await jobAd.save();

    res.status(201).json({ message: 'Message saved successfully.' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//post messages from client or job poster end
app.post('/job/:jobId/bid/:bidId/message', async (req, res) => {
  const { jobId, bidId } = req.params;
  const { senderId, receiverId, message } = req.body;
  console.log(`${jobId}::${bidId}::${senderId} ${receiverId} ${message}`)
  try {
    const jobAd = await JobAd.findOne({ _id: jobId, 'bids._id': bidId });

    if (!jobAd) {
      return res.status(404).json({ message: 'Job or bid not found.' });
    }

    const bidIndex = jobAd.bids.findIndex((bid) => bid._id.toString() === bidId);
    const newMessage = {
      senderId,
      receiverId,
      message,
    };
    console.log(`saving message data ${senderId}::${receiverId}::${message}`)
    jobAd.bids[bidIndex].messages.push(newMessage);
    console.log(`saving message data ${senderId}::${receiverId}::${message}`)
    await jobAd.save();

    res.status(201).json({ message: 'Message saved successfully.' });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get messages for bidder's view
app.get('/job/:jobId/bid/:bidderId/messages', async (req, res) => {
  const { jobId, bidderId } = req.params;

  try {
    //const jobAd = await JobAd.findOne({ _id: jobId, 'bids._id': bidId });
    const jobAd = await JobAd.findOne({ _id: jobId, 'bids.bidderId': bidderId});
    
    if (!jobAd) {
      return res.status(404).json({ message: 'Job or bid not found.' });
    }
    else {
      console.log(`Messages for job ${jobId} and bidder ${bidderId} found`)
    }

    const bidIndex = jobAd.bids.findIndex((bid) => bid.bidderId === bidderId);
    const messages = jobAd.bids[bidIndex].messages;

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Endpoint to get all job posts by a specific user
app.get('/get-jobads/:userid', async (req, res) => {
  try {
    const userId = req.params.userid;

    // Find all job ads by the specified user
    const jobAds = await JobAd.find({ userid: userId });

    res.status(200).json(jobAds);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'failed', error: 'Internal Server Error' });
  }
});

app.get('/search-ads', async (req, res) => {
  try {
    const searchString = req.query.search; // Assuming the search string is passed as a query parameter

    // Using a regular expression to perform a case-insensitive search in both title and description
    const results = await JobAd.find({
      $or: [
        { title: { $regex: searchString, $options: 'i' } },
        { description: { $regex: searchString, $options: 'i' } },
      ],
    });

    res.json(results);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'failed', error: 'Internal Server Error' });
  }
});

// Endpoint to get all jobs a user has placed a bid on
app.get('/user-bids/:bidderId', async (req, res) => {
  try {
    const bidderId = req.params.bidderId;

    // Find jobs where the user has placed a bid
    const jobsWithBids = await JobAd.find({ 'bids.bidderId': bidderId });

    // Extract and format the necessary fields
    const userBids = jobsWithBids.map((job) => ({
      jobid:job._id,
      userid: job.userid,
      title: job.title,
      description: job.description,
      budget: job.budget,
      close: job.close,
      createdAt: job.createdAt,
      bids: job.bids
        .filter((bid) => bid.bidderId === bidderId) // Filter bids for the specific user
        .map((filteredBid) => ({
          bidAmount: filteredBid.bidAmount,
          bidTime: filteredBid.bidTime,
        })),
    }));
    //console.log(`Messages for ${job._id} and ${bidderId} found`)
    res.status(200).json(userBids);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
      const { email, id, firstName, lastName, mobile, image } = req.body;
  
      // Find the user by email or ID
      const user = await User.findOne({ $or: [{ email }, { _id: id }] });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (mobile) user.mobile = mobile;
      if (image) user.image = image; // Update the image field
  
      // Save the updated user
      await user.save();
  
      return res.status(200).json({ message: 'Profile updated successfully', user });
  
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Failed', error: 'Internal Server Error' });
    }
  })

  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user with the given email exists in the database
      const existingUser = await User.findOne({ email });
  
      if (!existingUser) {
        return res.status(200).json({ message: "failed", error: 'User not found' });
      }
  
      // Verify the password
      const isPasswordValid = await new Promise((resolve, reject) => {
        bcrypt.compare(password, existingUser.password, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
  
      if (isPasswordValid) {
        // Passwords match, generate a JWT
        const token = jwt.sign({ userId: existingUser.id }, secretKey, { expiresIn: '24h' });
  
        return res.status(200).json({ message: "success", userid: existingUser.id,token:token, email: existingUser.email, firstname:existingUser.firstName });
      } else {
        console.log(`Unable to authenticate user ${existingUser.email}`);
        return res.status(200).json({ message: "fail", error: "Invalid credential" });
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: "fail", error: 'Internal Server Error' });
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
            
      return res.status(200).json({ message: 'success', userid: newUser.id, token: token, email: email, id: newUser.id, firstname: newUser.firstName });
  }
  catch(error) {
    console.error('Error:', error);
    return res.status(500).json({ message: "failed", error: 'Internal Server Error' });
  }
});
  

app.post('/post-postads', async (req, res) => {
  try {
    const { userid,title, description, budget } = req.body;
    console.log(`PostJobAd ${title}::${userid}`)
    // Create a new JobAd instance
    const newJobAd = new JobAd({
      userid,
      title,
      description,
      budget,
    });

    // Save the new JobAd to the database
    const savedJobAd = await newJobAd.save();

    res.status(201).json({message: 'success', savedJobAd});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'failed', error: 'Internal Server Error' });
  }
});

app.post('/bid', async (req, res) => {
  try {
    const { jobId, bidderId, bidAmount } = req.body;

    // Check if the job post exists
    const jobPost = await JobAd.findById(jobId);
    if (!jobPost) {
      return res.status(404).json({ message: 'Job post not found' });
    }

    // Check if the job post is still open for bidding
    if (jobPost.close) {
      return res.status(400).json({ message: 'Job post is closed for bidding' });
    }

    // Add the bid to the job post
    jobPost.bids.push({
      bidderId,
      bidAmount,
    });

    // Save the updated job post
    await jobPost.save();

    res.status(201).json({ message: 'Bid added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint to mark a bid as rewarded
app.post('/job/reward-bid/:jobId/:bidId', async (req, res) => {
  const { jobId, bidId } = req.params;

  try {
    const jobAd = await JobAd.findOne({ _id: jobId, 'bids._id': bidId });

    if (!jobAd) {
      return res.status(404).json({ message: 'Job or bid not found.' });
    }

    const bidIndex = jobAd.bids.findIndex((bid) => bid._id.toString() === bidId);

    // Mark the bid as rewarded
    jobAd.bids[bidIndex].rewarded = true;

    await jobAd.save();

    res.status(200).json({ message: 'Bid marked as rewarded successfully.' });
  } catch (error) {
    console.error('Error marking bid as rewarded:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
