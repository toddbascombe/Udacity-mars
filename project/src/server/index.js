require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
const { Map } = require("immutable");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

var store = Map({});

const displayData = (JsonParsedData) => {
  return { JsonParsedData };
};

//get all the rovers pictures
const getAllRoverData = async (roverData) => {
  var store2 = {};
  for (rover of roverData) {
    await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.name.toLowerCase()}/photos?sol=1000&api_key=${
        process.env.API_KEY
      }`
    )
      .then(responseParser)
      .then((dataObject) => {
        store2[rover.name] = dataObject.JsonParsedData;
        // store = store.set(rover.name, store2[rover.name]);
      });
  }
  const roverNames = Object.keys(store2);
  roverNames.forEach((name) => {
    store = store.set(name, store2[name]);
  });
};

//parse Json data from api call
const responseParser = (jsonData) => {
  return jsonData.status === 200
    ? jsonData.json().then(displayData)
    : { error: "Problem with request" };
};

//fetch all the rovers
//after the fect is completed, another fect will start to get each rover pictures
app.get("/rovers", async (req, res) => {
  await fetch(
    `https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${process.env.API_KEY}`
  )
    .then(responseParser)
    .then((dataObject) => {
      res.json(dataObject);
      return dataObject;
    })
    .then((secondObj) => getAllRoverData(secondObj.JsonParsedData.rovers))
    .catch(displayData);
});

//get Nasa data from the store.
//This increase the speed of data get
app.get("/rovers/:name", async (req, res) => {
  res.json({ rover: store.get(req.params.name) });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
