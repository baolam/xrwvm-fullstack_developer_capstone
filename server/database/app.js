const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(express.json());

// Load JSON data safely from data directory or root
let reviews_path = fs.existsSync(path.join(__dirname, 'data', 'reviews.json'))
  ? path.join(__dirname, 'data', 'reviews.json')
  : path.join(__dirname, 'reviews.json');

let dealerships_path = fs.existsSync(path.join(__dirname, 'data', 'dealerships.json'))
  ? path.join(__dirname, 'data', 'dealerships.json')
  : path.join(__dirname, 'dealerships.json');

const reviews_data = JSON.parse(fs.readFileSync(reviews_path, 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync(dealerships_path, 'utf8'));

let inMemoryReviews = [...reviews_data['reviews']];
let inMemoryDealerships = [...dealerships_data['dealerships']];

let isMongoConnected = false;
const Reviews = require('./review');
const Dealerships = require('./dealership');

mongoose.connect("mongodb://localhost:27017/", { dbName: 'dealershipsDB', serverSelectionTimeoutMS: 2000 })
  .then(() => {
    isMongoConnected = true;
    console.log("Connected to MongoDB successfully");
    Reviews.deleteMany({}).then(() => {
      Reviews.insertMany(reviews_data['reviews']);
    });
    Dealerships.deleteMany({}).then(() => {
      Dealerships.insertMany(dealerships_data['dealerships']);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed, running in memory-fallback mode:", err.message);
    isMongoConnected = false;
  });

// Express route to home
app.get('/', async (req, res) => {
  res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    if (isMongoConnected) {
      const documents = await Reviews.find();
      return res.json(documents);
    }
    res.json(inMemoryReviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    if (isMongoConnected) {
      const documents = await Reviews.find({ dealership: dealerId });
      return res.json(documents);
    }
    const filtered = inMemoryReviews.filter(r => r.dealership === dealerId);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const documents = await Dealerships.find();
      return res.json(documents);
    }
    res.json(inMemoryDealerships);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const stateParam = req.params.state.toLowerCase();
    if (isMongoConnected) {
      const documents = await Dealerships.find({
        $or: [
          { state: new RegExp('^' + req.params.state + '$', 'i') },
          { st: new RegExp('^' + req.params.state + '$', 'i') }
        ]
      });
      return res.json(documents);
    }
    const filtered = inMemoryDealerships.filter(d => 
      (d.state && d.state.toLowerCase() === stateParam) || 
      (d.st && d.st.toLowerCase() === stateParam)
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const idParam = parseInt(req.params.id);
    if (isMongoConnected) {
      const document = await Dealerships.findOne({ id: idParam });
      return res.json(document);
    }
    const dealer = inMemoryDealerships.find(d => d.id === idParam);
    res.json(dealer || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    let data;
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      data = JSON.parse(req.body.toString());
    } else {
      data = req.body;
    }

    let new_id = (inMemoryReviews.length > 0 ? Math.max(...inMemoryReviews.map(r => r.id)) : 0) + 1;

    const newReview = {
      id: new_id,
      name: data['name'],
      dealership: parseInt(data['dealership']),
      review: data['review'],
      purchase: data['purchase'],
      purchase_date: data['purchase_date'],
      car_make: data['car_make'],
      car_model: data['car_model'],
      car_year: data['car_year']
    };

    inMemoryReviews.push(newReview);

    if (isMongoConnected) {
      const reviewDoc = new Reviews(newReview);
      await reviewDoc.save();
    }

    res.json(newReview);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
