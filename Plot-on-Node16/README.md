# Plot  
This app lets you search for plants on the OpenFarm API and add them to a personalized garden "plot" that is tied to your name. The list is stored in MongoDB by means of GET and POST endpoints, created with Express and NodeJS. 
  
# Credits  
Made by [Harold](https://nsitu.ca). Thanks to [OpenFarm API](https://github.com/openfarmcc/OpenFarm) for the plant data. Plots persisted with [MongoDB](https://www.mongodb.com/). Backend written with [NodeJS](https://nodejs.org/) and [Express](https://expressjs.com/). Frontend written with [VueJS](https://vuejs.org/). Hosted by Heroku.


# Environment Variables  
You should add your MongoDB connection string as an environent variable. For example, it might look something like this: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net`. (Replace "username" and "password" in the connection string with your actual username and password).  