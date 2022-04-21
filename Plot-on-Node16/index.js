/**
* PLOT is an app that lets you find and save your favourite crops.
* We use the OpenFarm API to find crop data. See also:
* https://github.com/openfarmcc/OpenFarm/blob/master/docs/api_docs.md 
* We use MongoDB to maintain a list of crops for each user.
*/ 

// get environment variables
require('dotenv').config() 

// SETUP MONGODB
const MONGODB_URI = process.env.MONGODB_URI 

// MongoDB Driver
const { MongoClient } = require('mongodb') 


// axios HTTP client https://www.npmjs.com/package/axios
const axios = require('axios');  

/* SETUP EXPRESS */
const express = require ('express')   // express framework 
const cors = require ('cors')         // Cross Origin Resource Sharing
const bodyParser = require('body-parser') // middleware to parse JSON data that is sent from the frontend.
const app = express(); // enable express
app.use( cors() ); // make express attach CORS headers to responses
app.use( express.json() ); // add json capabilities to our express app 

/* Serve up static assets, i.e. the Frontend of the site. */
app.use( '/', express.static('public')) 

  
/** listen for users' searches from the frontend */
app.get('/search', async (req,res) => { 
    /** relay search filters to the openfarm API */
    axios.get(
        'https://openfarm.cc/api/v1/crops/', 
        {params: {filter: req.query.filter}}
    )
    .then( results => { 
        // check if the crops have images or not before sending them.
        let cropsWithImage = results.data.data.filter(
            crop=>crop.attributes.main_image_path.includes('s3.amazon')
        )
        if( cropsWithImage.length) return res.send(cropsWithImage) 
        res.send("No Results")  
        
    })
    .catch( err=> res.send("Search Error") )
})

// Connect to MongoDB
// See also https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
.then(client =>{ 
    const myCollection = client.db("plot").collection("plots")

/** fetch a plot (list of crops) for a given farmer. */
app.get('/plot', (req,res) => {   
    myCollection.findOne(
        { farmer: req.query.farmer  }, 
        (error, plot)=>{
            /** If there is no result send a blank default plot. */
            if (error || plot == null) {
                return res.send({
                    farmer:req.query.farmer, 
                    crops: []
                })
            } 
            /** send the full data */
            res.send( plot )
        }
    ) 
})

/** Add/update a plot for a given farmer. 
 * See also: https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/
 * Read more about update operators: 
 * https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators  */
app.post( '/plot', bodyParser.json(), (req,res) => { 
    myCollection.updateOne(
        {farmer: req.body.farmer}, 
        {$set: { crops : req.body.crops } },  
        {upsert: true},  /** upsert = create if it doesnt exist. */
        (error) => { 
            if (error)  return res.send('Error') 
            res.send('Data saved')
        }
    )
})
 

}) 



/** Tell Express to start listening. */
const PORT = process.env.PORT || 5000  
app.listen(PORT, () => {
  console.log("We are live on port "+PORT )
})