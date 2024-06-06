document.addEventListener("DOMContentLoaded", () => {
  // Create the welcome screen overlay
  const welcomeScreen = document.createElement("div");
  welcomeScreen.id = "welcome-screen";
  welcomeScreen.style.position = "fixed";
  welcomeScreen.style.top = "0";
  welcomeScreen.style.left = "0";
  welcomeScreen.style.width = "100%";
  welcomeScreen.style.height = "100%";
  welcomeScreen.style.backgroundColor = "#fff";
  welcomeScreen.style.display = "flex";
  welcomeScreen.style.justifyContent = "center";
  welcomeScreen.style.alignItems = "center";
  welcomeScreen.style.zIndex = "10000";
  welcomeScreen.style.transition = "transform 0.5s ease"; // Add transition for smooth slide up

  // Create the welcome message and button container
  const welcomeMessage = document.createElement("div");
  welcomeMessage.style.textAlign = "center";
  welcomeMessage.className = "welcome-msg";

  const welcomeText = document.createElement("h1");
  const textContent = "Best Beaches in the World!";
  const words = textContent.split(" ");

  // Wrap each word in a span and append to the welcomeText element
  words.forEach((word, index) => {
    const wordSpan = document.createElement("span");
    wordSpan.textContent = word;
    wordSpan.style.display = "inline-block";
    wordSpan.style.opacity = 0;
    wordSpan.style.transform = "translateY(100%)";
    wordSpan.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    wordSpan.style.transitionDelay = `${index * 0.3}s`; // delay each word
    welcomeText.appendChild(wordSpan);
    welcomeText.appendChild(document.createTextNode(" ")); // Add space between words
  });

  welcomeMessage.appendChild(welcomeText);

  // Trigger the animation
  setTimeout(() => {
    const wordSpans = welcomeText.querySelectorAll("span");
    wordSpans.forEach((span) => {
      span.style.opacity = 1;
      span.style.transform = "translateY(0)";
    });
  }, 100);

  // Create the "Let's Start" button
  const startButton = document.createElement("button");
  startButton.textContent = "Surf's Up!";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "16px";
  startButton.style.cursor = "pointer";
  startButton.style.display = "flex";
  startButton.style.alignItems = "center";
  startButton.style.justifyContent = "center";
  startButton.style.gap = "12px";
  startButton.style.borderRadius = "12px";
  startButton.style.background = "#ffffff";
  startButton.style.border = "none";
  startButton.style.fontWeight = "800";
  startButton.style.color = "#3992b5";
  welcomeMessage.appendChild(startButton);

  const iconImg = document.createElement("img");
  iconImg.src = "assests/surf.png"; // Replace with the path to your image
  iconImg.alt = "Description of the image"; // Replace with a description of the image (for accessibility)
  iconImg.style.width = "20px"; // Adjust the width of the image as needed
  iconImg.style.height = "20px"; // Adjust the height of the image as needed
  startButton.appendChild(iconImg);

  // Append the welcome message to the welcome screen
  welcomeScreen.appendChild(welcomeMessage);

  // Append the welcome screen to the body
  document.body.appendChild(welcomeScreen);

  // Add event listener to the start button to remove the welcome screen
  startButton.addEventListener("click", () => {
    // Slide up the welcome screen
    welcomeScreen.style.transform = "translateY(-100%)";

    // Remove the welcome screen after the transition ends
    welcomeScreen.addEventListener("transitionend", () => {
      document.body.removeChild(welcomeScreen);

      // Initialize your existing features/layout here
      initializeMapAndFeatures();
    });
  });
  function initializeMapAndFeatures() {
    const width = window.innerWidth - 20;
    const height = window.innerHeight - 10;

    // Create the SVG element dynamically and append it to the body
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Define the projection and path generator
    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Define the zoom behavior
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

    // Append a group element to the SVG to hold the map and circles
    const g = svg.append("g");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "3px");

    const sidebar = d3
      .select("body")
      .append("div")
      .attr("class", "sidebar")
      .style("position", "fixed")
      .style("left", "0px")
      .style("width", "100px")
      .style("height", "100%")
      .style("background-color", "#f5f7f9")
      // .style("box-shadow", "rgb(0 0 0 / 5%) 0px 0px 15px")
      .style("padding", "10px 0px 10px 10px")
      .style("transition", "right 0.3s ease")
      .style("overflow-y", "auto")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-item", "center")
      .style("z-index", "10");

    // Sidebar content
    const sidebarContent = sidebar
      .append("div")
      .attr("class", "sidebar-content");

    const secondSidebar = d3
      .select("body")
      .append("div")
      .attr("class", "second-sidebar")
      .style("position", "fixed")
      .style("top", "0")
      .style("left", "110px")
      .style("width", "408px")
      .style("height", "100%")
      .style("background-color", "#fff")
      .style("box-shadow", "0px 0px 15px rgba(0,0,0,0.3)")
      .style("padding", "18px 10px")
      .style("transition", "left 0.3s ease")
      .style("overflow-y", "auto")
      .style("display", "none");

    const secondSidebarContent = secondSidebar
      .append("div")
      .attr("class", "second-sidebar-content");

    function createStarRating(rating) {
      const maxStars = 5;
      const starContainer = document.createElement("div");
      starContainer.className = "star-rating";
      //   starContainer.textContent= rating
      const ratingTextNode = document.createElement("span");
      ratingTextNode.textContent = rating;
      ratingTextNode.style.marginRight = "6px";
      starContainer.appendChild(ratingTextNode);

      for (let i = 1; i <= maxStars; i++) {
        const star = document.createElement("span");
        star.className = "star";
        if (i <= rating) {
          star.textContent = "★";
          star.style.color = "#f59e0b";
          star.style.fontSize = "26px";
        } else {
          star.textContent = "☆";
          star.style.color = "#f59e0b";
          star.style.fontSize = "26px";
        }
        starContainer.appendChild(star);
      }
      return starContainer;
    }
    function createPriceDiv(rating) {
      const maxStars = 5;
      const starContainer = document.createElement("div");
      starContainer.className = "star-rating";
      //   starContainer.textContent= rating
      const ratingTextNode = document.createElement("span");
      ratingTextNode.textContent = rating;
      ratingTextNode.style.marginRight = "6px";
      starContainer.appendChild(ratingTextNode);

      for (let i = 1; i <= maxStars; i++) {
        const star = document.createElement("span");
        star.className = "star";
        if (i <= rating) {
          star.textContent = "$";
          star.style.color = "#04395e";
        }
        starContainer.appendChild(star);
      }
      return starContainer;
    }

    function popularFor(values) {
      const poplurForDiv = document.createElement("div");
      poplurForDiv.classList = "popular-for-div";
      values.split(",").map((v) => {
        const elementDiv = document.createElement("div");
        elementDiv.className = "chip-popular-for";
        elementDiv.textContent = v;
        poplurForDiv.appendChild(elementDiv);
      });
      return poplurForDiv;
    }

    async function getWeatherData(location) {
      const apiKey = "e76f61ef418567e42359d927d4844b4c";
      const lat = location[1];
      const long = location[0];
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      const data = await response.json();
      return data;
    }

    const loader = document.createElement("div");
    loader.id = "loader";
    loader.innerText = "Loading...";
    loader.style.position = "fixed";
    loader.style.bottom = "10px";
    loader.style.textAlign = "center";
    loader.style.zIndex = "1000";

    const spinner = document.createElement("div");
    spinner.className = "spinner";

    // Function to open the second sidebar with details
    async function openSecondSidebar(data, selectedElement) {
      loader.appendChild(spinner);
      document.body.appendChild(loader);
      const starRating = createStarRating(data.rating);
      const priceDiv = createPriceDiv(data.price);
      const pop = popularFor(data.popularFor);
      const currentWeather = await getWeatherData(data.coords);
      // Remove 'selected-point' class from all points in the sidebar
      d3.selectAll(".point").classed("selected-point", false);

      // Optionally remove any previously selected circle styling
      d3.selectAll("circle").classed("selected-circle", false);
      // Add 'selected-point' class to the selected element if it is a sidebar point
      if (selectedElement.tagName === "circle") {
        const pointDiv = d3.select(`.point-${data.id}`);
        pointDiv.classed("selected-point", true);
      } else {
        d3.select(selectedElement).classed("selected-point", true);
      }

      secondSidebarContent.html(
        `<h2>${data.name}</h2><img src="${data.imageUrl}" alt="${
          data.name
        }" style="width: 100%; height: auto; border-radius: 25px;"><p>${
          data.description
        }</p><div class="star-rating-container"><p class='rating-label'>Rating</p></div><div class="price-container"><p class='price-label'>Price</p></div><div class="best-know-for-container"><p class='best-know-label'>Popular for</p></div><div class="best-time-to-visit-container"><p class='best-time-to-visit-label'>Best time to visit</p>${
          data.bestTimeToVisit
        }</div><div class="weather-container"><div class='temp-date-section'><div class='temp-icon'><img src=https://openweathermap.org/img/wn/${
          currentWeather.weather[0].icon
        }@2x.png alt="Weather icon" style={{width:'24px !important',height:'24px !important',filter:'drop-shadow(2px 2px 2px #00000040) !important'}} class='icon-weather'/><p class='temp'>${
          currentWeather.main.temp
        }°C</p></div><div class='label-date-section'><h2 class='weather-label'>Weather</h2><p>${new Date().toLocaleDateString(
          [],
          { month: "short", day: "2-digit", year: "numeric" }
        )}</p><p>${currentWeather.weather[0].main}</p></div></div></div>`
      );
      secondSidebarContent
        .select(".star-rating-container")
        .node()
        .appendChild(starRating);
      secondSidebarContent
        .select(".price-container")
        .node()
        .appendChild(priceDiv);

      secondSidebarContent
        .select(".best-know-for-container")
        .node()
        .appendChild(pop);
      document.body.removeChild(loader);
      secondSidebar.style("display", "block");
    }

    // Function to close the second sidebar
    function closeSecondSidebar() {
      d3.selectAll(".point").classed("selected-point", false);
      secondSidebar.style("display", "none");
    }

    const closeButtonSvg = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" fill="#155e75 !important"  viewBox="0 0 30 30" width="12px" height="12px" class='close'>    <path fill="#155e75 !important" class='close' d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z"/></svg>`;

    secondSidebar
      .append("button")
      .html(closeButtonSvg) // Use .html() to insert the SVG content
      .style("position", "absolute")
      .style("top", "10px")
      .style("right", "10px")
      .style("background", "none")
      .style("border", "none")
      .style("cursor", "pointer")
      .on("click", closeSecondSidebar);

    // Function to close the sidebar
    function closeSidebar() {
      sidebar.style("right", "-250px");
    }

    const fitToSizeButton = d3
      .select("body")
      .append("button")
      .attr("id", "fit-to-size-button")
      .text("Fit to Size")
      .style("position", "fixed")
      .style("top", "10px")
      .style("right", "10px")
      .style("z-index", "9999");

    // Add click event listener to the fit to size button
    fitToSizeButton.on("click", function () {
      // Calculate the center of the map
      const centerX = width / 16;
      const centerY = height / 16;

      // Apply a transition to move the map to the center
      g.transition()
        .duration(750)
        .attr("transform", `translate(${centerX},${centerY})`);
    });

    // Load and display the world map
    d3.json("https://unpkg.com/world-atlas@1/world/110m.json")
      .then((worldData) => {
        const countries = topojson.feature(
          worldData,
          worldData.objects.countries
        );

        g.selectAll("path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", "#ccc")
          .attr("stroke", "#333");

        // Points to plot
        const points = [
          {
            id: 1,
            coords: [148.33680227247243, -19.61247505387655],
            name: "Whitehaven Beach, Australia",
            imageUrl: "assests/Whitehaven_Beach_Australia.jpeg",
            description:
              "Located on Whitsunday Island, Whitehaven Beach is famous for its stunning white silica sand and turquoise waters. It's a perfect spot for swimming, sunbathing, and enjoying the natural beauty of the Great Barrier Reef.",
            rating: 4.8,
            popularFor: "Swimming, Sunbathing, Snorkeling",
            bestTimeToVisit: "June, July, August",
            price: 4,
          },
          {
            id: 2,
            coords: [-72.16605667584439, 21.798115606663217],
            name: "Grace Bay, Turks and Caicos",
            imageUrl: "assests/Grace_Bay_Turks_and_Caicos.jpeg",
            description:
              "Grace Bay is known for its calm, clear waters and powdery white sand. This beach is ideal for snorkeling, diving, and enjoying luxury resorts that line its shore.",
            rating: 4.7,
            popularFor: "Snorkeling, Diving, Luxury Resorts",
            bestTimeToVisit: "April, May, June",
            price: 5,
          },
          {
            id: 3,
            coords: [-32.44416131624384, -3.855088109937202],
            name: "Baia do Sancho, Brazil",
            imageUrl: "assests/Baia_do_Sancho_Brazil.jpeg",
            description:
              "Baia do Sancho, located on Fernando de Noronha island, offers stunning cliffs, vibrant marine life, and crystal-clear waters, making it a paradise for divers and nature lovers.",
            rating: 4.9,
            popularFor: "Diving, Nature Watching",
            bestTimeToVisit: "January, February, March",
            price: 4,
          },
          {
            id: 4,
            coords: [20.624821626042973, 37.85928892095863],
            name: "Navagio Beach, Greece",
            imageUrl: "assests/Navagio_Beach_Greece.jpeg",
            description:
              "Also known as Shipwreck Beach, Navagio Beach is famous for the rusting shipwreck that rests on its sands. Accessible only by boat, this secluded cove is surrounded by towering cliffs and azure waters.",
            rating: 4.6,
            popularFor: "Sightseeing, Photography",
            bestTimeToVisit: "May, September, October",
            price: 3,
          },
          {
            id: 5,
            coords: [-86.96042132759503, 20.780145686767867],
            name: "Playa Paraiso, Mexico",
            imageUrl: "assests/Playa_Paraiso_Mexico.jpg",
            description:
              "Playa Paraiso, located in Tulum, offers pristine white sands and turquoise waters against the backdrop of ancient Mayan ruins. It's a perfect blend of history and natural beauty.",
            rating: 4.8,
            popularFor: "Swimming, Snorkeling, Mayan Ruins",
            bestTimeToVisit: "December, January, February",
            price: 4,
          },
          {
            id: 6,
            coords: [55.82715661449652, -4.370898171994521],
            name: "Anse Source d'Argent, Seychelles",
            imageUrl: "assests/Anse_Source_d'Argent_Seychelles.jpeg",
            description:
              "Anse Source d'Argent is renowned for its unique granite boulders, shallow clear waters, and soft white sand. This beach is perfect for photography, snorkeling, and relaxation.",
            rating: 4.9,
            popularFor: "Photography, Snorkeling, Relaxation",
            bestTimeToVisit: "March, April, May",
            price: 5,
          },
          {
            id: 7,
            coords: [-81.39311432907134, 19.70738113909201],
            name: "Seven Mile Beach, Cayman Islands",
            imageUrl: "assests/Seven_Mile_Beach_Cayman_Islands.jpg",
            description:
              "Stretching for seven miles, this beach offers soft coral sand, clear waters, and numerous activities such as snorkeling, paddleboarding, and enjoying beachside restaurants and bars.",
            rating: 4.7,
            popularFor: "Snorkeling, Paddleboarding, Dining",
            bestTimeToVisit: "June, July, August",
            price: 4,
          },
          {
            id: 8,
            coords: [-151.789633417515, -16.076057994209854],
            name: "Bora Bora, French Polynesia",
            imageUrl: "assests/Bora_Bora_French_Polynesia.jpeg",
            description:
              "Bora Bora is known for its stunning lagoon, overwater bungalows, and vibrant coral reefs. It's a perfect destination for honeymooners and those seeking luxury and tranquility.",
            rating: 4.8,
            popularFor: "Honeymoon, Luxury, Snorkeling",
            bestTimeToVisit: "July, August, September",
            price: 5,
          },
          {
            id: 9,
            coords: [-157.67911750177166, 21.49070235674021],
            name: "Lanikai Beach, Hawaii",
            imageUrl: "assests/Lanikai_Beach_Hawaii.jpg",
            description:
              "Lanikai Beach features powdery white sand and calm, clear waters, making it a favorite for swimming, kayaking, and enjoying the scenic views of the Mokulua Islands.",
            rating: 4.7,
            popularFor: "Swimming, Kayaking, Scenic Views",
            bestTimeToVisit: "May, June, July",
            price: 4,
          },
          {
            id: 10,
            coords: [-76.63242185703174, 25.50778303764861],
            name: "Pink Sands Beach, Bahamas",
            imageUrl: "assests/Pink_Sands_Beach_Bahamas.jpg",
            description:
              "Pink Sands Beach is famous for its unique pink-hued sand, clear waters, and serene atmosphere. It's an idyllic spot for beachcombing, swimming, and relaxing in paradise.",
            rating: 4.8,
            popularFor: "Beachcombing, Swimming, Relaxation",
            bestTimeToVisit: "February, March, April",
            price: 4,
          }, // Correct order: [longitude, latitude]
          // Additional points can be added here
        ];

        sidebarContent.html("");

        // Loop through the points array and create HTML elements for each point
        points.forEach((point, index) => {
          // Create a div element for each point
          const pointDiv = sidebarContent
            .append("div")
            .on("click", function (event, d) {
              openSecondSidebar(point, this);
            })
            .attr("id", `point-${point.id}`)
            .attr("class", `point point-${point.id}`);

          // Add the point's name as text
          pointDiv
            .append("p")
            .text(point.name.split(",")[0])
            .attr("font-size", "11px")
            .attr("color", "#70757a")
            .attr("class", "side-bar-text");

          // Add the point's image
          pointDiv
            .append("img")
            .attr("src", point.imageUrl)
            .attr("alt", point.name)
            .attr("width", "32px")
            .style("border-radius", "25%")
            .attr("height", "32px");

          // Add a tooltip
          pointDiv
            .append("span")
            .attr("class", "tooltip")
            .text(point.name.split(",")[0]);
        });

        // Create patterns for each image
        svg
          .append("defs")
          .selectAll("pattern")
          .data(points)
          .enter()
          .append("pattern")
          .attr("id", (d, i) => `image-${i}`)
          .attr("width", 1)
          .attr("height", 1)
          .attr("viewBox", "0 0 100 100")
          .append("image")
          .attr("xlink:href", (d) => d.imageUrl)
          .attr("width", 100)
          .attr("height", 100)
          .attr("preserveAspectRatio", "xMidYMid slice");

        // Plot the points using the same projection
        const circles = g
          .selectAll("circle")
          .data(points)
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            const [x, y] = projection(d.coords);
            return x;
          })
          .attr("cy", function (d) {
            const [x, y] = projection(d.coords);
            return y;
          })
          .attr("r", 10)
          .attr("fill", (d, i) => `url(#image-${i})`)
          .attr("stroke-width", 1)
          .on("mouseover", function (event, d) {
            d3.select(this).raise();
            tooltip.html(d.name).style("visibility", "visible");
          })
          .on("mousemove", function (event) {
            tooltip
              .style("top", event.pageY - 10 + "px")
              .style("left", event.pageX + 10 + "px");
          })
          .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
          })
          .on("click", function (event, d) {
            openSecondSidebar(d, this);
          })
          .attr("id", function (d) {
            return `point-${d.id}`;
          })
          .attr("filter", "drop-shadow(4px 2px 2px rgb(0 0 0 / 0.5))");

        // Apply the zoom behavior to the SVG
        svg.call(zoom);
      })
      .catch((error) => {
        console.error("Error loading or processing data:", error);
      });

    // Zoom function
    function zoomed(event) {
      const { transform } = event;
      g.attr("transform", transform);
      g.attr("stroke-width", 1 / transform.k);

      // Adjust circle radius according to zoom level
      g.selectAll("circle").attr("r", 10 * transform.k);
    }

    document.addEventListener("DOMContentLoaded", () => {
      const mainDiv = document.createElement("div");
      mainDiv.id = "main";
      //   mainDiv.style.width = "100vw";
      //   mainDiv.style.height = "100vh";
      document.body.appendChild(mainDiv);
    });

    // Update the SVG size on window resize
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      svg.attr("width", newWidth).attr("height", newHeight);

      projection.scale(newWidth / 6).translate([newWidth / 2, newHeight / 2]);

      g.selectAll("path").attr("d", path);
      g.selectAll("circle")
        .attr("cx", (d) => projection(d.coords)[0])
        .attr("cy", (d) => projection(d.coords)[1]);
    });
  }
});
