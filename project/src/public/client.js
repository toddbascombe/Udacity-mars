let store = {
  user: { name: "Student" },
  apod: "",
  rovers: [],
  rover_pic_data: [],
};

const getRovers = (roverData) => {
  updateStore(store, { rovers: roverData }, "mainDisplay");
};

const roverDataOnLoad = () => {
  fetch("http://localhost:3000/rovers")
    .then((data) => data.json())
    .then((res) => getRovers(res.JsonParsedData.rovers));
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (store, newState, page) => {
  store = Object.assign(store, newState);
  render(root, store, page);
};

const render = async (root, state, page) => {
  if (page === "mainDisplay") {
    root.innerHTML = App(state, mainDisplay);
  } else if (page === "error") {
    root.innerHTML = App(state, error);
  } else root.innerHTML = App(state, pictureParent);
};

// create content
const App = (state, callback) => {
  return callback(state);
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
  roverDataOnLoad();
  render(root, store, "mainDisplay");
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
  if (name) {
    return `
            <h1>Welcome, ${name}!</h1>
        `;
  }

  return `
        <h1>Hello!</h1>
    `;
};

const displayRover = (roverInfo) => {
  return `
    <section id=${roverInfo.name}>
        <h2>${roverInfo.name} </h2>
        <p>Launch Date: ${roverInfo.launch_date}</p>
        <p>Land On Mar Date: ${roverInfo.landing_date}</p>
        <p>Rover Status: ${roverInfo.status}</p>
        <p>Photos Captured : ${roverInfo.total_photos}</p>
        <p> Most Recent Photos: ${roverInfo.max_date}</p>
    </section>
    `;
};

const mainDisplay = (state) => `
        <div class="main__heading">
          <header class="load-display">Exploring Mars</header>
          <main class="load-display">
            ${Greeting(state.user.name)}
          </main>
        </div>
        <h2 class="sub__heading"> Pick A Rover To Explore: </h2>
        <div class="rover__data">  
          ${state.rovers.map(displayRover).join("")}
        </div>  
        ${footer()}
    `;

const footer = () => `<footer></footer>`;

const displayPictures = (roverPic) => {
  return `
    <div>
      <img class="rover_image"src='${roverPic.img_src}'/>
      <p>
        <em>${roverPic.earth_date}</em>
        <em>Camera Name: ${roverPic.camera.full_name}</em>
    </div>
  
  `;
};

const pictureParent = (state) => `
  <h1>${state.rover_pic_data[0].rover.name} Rover</h1>
  <main class="picture_main">${state.rover_pic_data
    .map(displayPictures)
    .join("")}</main>`;

const error = (status) => `
    <div> ${status} No data to return </div>
`;
// ------------------------------------------------------  API CALLS
window.addEventListener("click", (event) => {
  const roverName = store.rovers.map((rover) => rover.name);
  if (roverName.includes(event.target.id)) {
    fetch(`http://localhost:3000/rovers/${event.target.id}`)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        updateStore(
          store,
          { rover_pic_data: data.rover.photos },
          "pictureParent"
        );
        render(root, store, "pictureParent");
      })
      .catch((res) => {
        render(root, res.status, "error");
      });
  }
});
