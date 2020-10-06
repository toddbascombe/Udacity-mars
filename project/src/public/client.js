let store = Immutable.Map({
  name: "Student",
  rover_pic_data: [],
});

const getRovers = (roverData, state) => {
  updateStore(state, { rovers: roverData }, "mainDisplay");
};

const roverDataOnLoad = () => {
  fetch("http://localhost:4000/rovers")
    .then((data) => data.json())
    .then((res) => getRovers(res.JsonParsedData.rovers, store))
    .catch((err) => render(root, err, "error"));
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState, page) => {
  store = state.merge(newState);
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

const displayRover = (
  max_date,
  name,
  other,
  status,
  sol,
  launch_date,
  landing_date,
  da,
  total_photos
) => {
  return `
    <section id=${name}>
        <h2>${name} </h2>
        <p>Launch Date: ${launch_date}</p>
        <p>Land On Mar Date: ${landing_date}</p>
        <p>Rover Status: ${status}</p>
        <p>Photos Captured : ${total_photos}</p>
        <p> Most Recent Photos: ${max_date}</p>
    </section>
    `;
};

const mainDisplay = (state) => `
        <div class="main__heading">
          <header class="load-display">Exploring Mars</header>
          <main class="load-display">
            ${Greeting(state.get("name"))}
          </main>
        </div>
        <h2 class="sub__heading"> Pick A Rover To Explore: </h2>
        <div class="rover__data">  
          ${
            state.get("rovers") === undefined
              ? "Loading..."
              : state
                  .get("rovers")
                  .keySeq()
                  .toArray()
                  .map((rover) =>
                    displayRover(
                      ...state.get("rovers").get(rover).valueSeq().toArray()
                    )
                  )
                  .join("")
          }
        </div>  
        ${footer()}
    `;

const footer = () => `<footer></footer>`;

const displayPictures = (id, sol, camera, img_src, earth_date, rover) => {
  return `
    <div>
      <img class="rover_image"src='${img_src}'/>
      <p>
        <em>${earth_date}</em>
        <em>Camera Name: ${camera.get("full_name")}</em>
    </div>
  
  `;
};

const pictureParent = (state) => `
  <h1>${state
    .get("rover_pic_data")
    .get("0")
    .get("rover")
    .get("name")} Rover</h1>
  <a href="/" class="back_btn"> go back </a>
  <main class="picture_main">${state
    .get("rover_pic_data")
    .keySeq()
    .toArray()
    .map((rover) =>
      displayPictures(
        ...state.get("rover_pic_data").get(rover).valueSeq().toArray()
      )
    )
    .join("")}</main>`;

const error = (status) => `
    <div> ${status} No data to return </div>
`;
// ------------------------------------------------------  API CALLS
window.addEventListener("click", (event) => {
  const roverName = store
    .get("rovers")
    .keySeq()
    .toArray()
    .map((rover) => store.get("rovers").get(rover).valueSeq().toArray()[1]);
  if (roverName.includes(event.target.id)) {
    fetch(`http://localhost:4000/rovers/${event.target.id}`)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((data) => {
        updateStore(
          store,
          { rover_pic_data: data.rover.latest_photos },
          "pictureParent"
        );
      })
      .catch((res) => {
        if (res.status === 500) render(root, res.status, "error");
      });
  }
});
