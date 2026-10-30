
// ==========================================
// GlobeX - Smart World Explorer
// SWYNEX Internship Task 3
// Frontend + Public APIs
// ==========================================

const API_URL = "https://countries.dev/countries?fields=name,alpha2Code,alpha3Code,capital,region,subregion,population,area,latlng,timezones,currencies,languages,flags,flag";

let countries = [];
let favorites = JSON.parse(
    localStorage.getItem("globexFavorites") || "[]"
);

// HTML elements
const countryContainer = document.getElementById("countryContainer");
const favoriteContainer = document.getElementById("favoriteContainer");
const statusMessage = document.getElementById("status");

const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const sortFilter = document.getElementById("sortFilter");

const totalCountries = document.getElementById("totalCountries");
const resultCount = document.getElementById("resultCount");
const favoriteCount = document.getElementById("favoriteCount");

const countryOne = document.getElementById("countryOne");
const countryTwo = document.getElementById("countryTwo");


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getCapital(country) {
    return country.capital || "Not available";
}

function getCurrency(country) {
    return (country.currencies || [])
        .map(item => `${item.name} (${item.symbol || item.code || ""})`)
        .join(", ") || "Not available";
}

function getLanguages(country) {
    return (country.languages || [])
        .map(item => item.name)
        .join(", ") || "Not available";
}

function getCountryByCode(code) {
    return countries.find(country => country.alpha2Code === code);
}

function getFlag(country) {
    return country.flags?.svg ||
        country.flags?.png ||
        "";
}


// ==========================================
// LOAD COUNTRIES FROM API
// ==========================================

async function loadCountries() {
    statusMessage.textContent = "🌍 Loading world data...";
    statusMessage.className = "status";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid country data received.");
        }

        countries = data;

        countries.sort((a, b) => {
            if (a.name === "India") return -1;
            if (b.name === "India") return 1;

            return a.name.localeCompare(b.name);
        });

        totalCountries.textContent = countries.length;

        fillCountryOptions();
        displayCountries(countries);
        displayFavorites();

        statusMessage.textContent = "";

    } catch (error) {
        console.error("Country API Error:", error);

        statusMessage.textContent =
            "Unable to load countries. Please check your internet connection and refresh the page.";

        statusMessage.className = "status error";
    }
}


// ==========================================
// COUNTRY CARD DESIGN
// ==========================================

function createCountryCard(country) {
    const name = country.name;
    const code = country.alpha2Code;
    const flag = getFlag(country);

    const isFavorite = favorites.includes(code);

    return `
        <article class="country-card">

            <div class="flag-container">
                <img
                    src="${escapeHTML(flag)}"
                    alt="${escapeHTML(name)} flag"
                    loading="lazy"
                >
            </div>

            <div class="country-info">

                <h3>${escapeHTML(name)}</h3>

                <p>
                    <strong>Capital:</strong>
                    ${escapeHTML(getCapital(country))}
                </p>

                <p>
                    <strong>Region:</strong>
                    ${escapeHTML(country.region || "Unknown")}
                </p>

                <p>
                    <strong>Population:</strong>
                    ${(country.population || 0).toLocaleString()}
                </p>

                <div class="card-actions">

                    <button onclick="showDetails('${escapeHTML(code)}')">
                        View Details
                    </button>

                    <button onclick="toggleFavorite('${escapeHTML(code)}')">
                        ${isFavorite ? "❤️ Saved" : "🤍 Favourite"}
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ==========================================
// DISPLAY COUNTRIES
// ==========================================

function displayCountries(list) {
    countryContainer.innerHTML = "";

    resultCount.textContent = list.length;

    if (list.length === 0) {
        countryContainer.innerHTML =
            '<p class="empty-message">No countries found.</p>';
        return;
    }

    countryContainer.innerHTML =
        list.map(createCountryCard).join("");
}


// ==========================================
// SEARCH, REGION FILTER AND SORT
// ==========================================

function filterCountries() {
    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedRegion = regionFilter.value;
    const selectedSort = sortFilter.value;

    let filtered = countries.filter(country => {
        const matchesName =
            country.name.toLowerCase().includes(searchText);

        const matchesRegion =
            selectedRegion === "all" ||
            country.region === selectedRegion;

        return matchesName && matchesRegion;
    });

    if (selectedSort === "population") {
        filtered.sort((a, b) =>
            (b.population || 0) - (a.population || 0)
        );
    } else {
        filtered.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    displayCountries(filtered);
}

searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);
sortFilter.addEventListener("change", filterCountries);


// ==========================================
// FAVOURITE COUNTRIES
// ==========================================

function toggleFavorite(code) {
    if (favorites.includes(code)) {
        favorites = favorites.filter(item => item !== code);
    } else {
        favorites.push(code);
    }

    localStorage.setItem(
        "globexFavorites",
        JSON.stringify(favorites)
    );

    filterCountries();
    displayFavorites();
}

function displayFavorites() {
    const favoriteCountries = countries.filter(country =>
        favorites.includes(country.alpha2Code)
    );

    favoriteCount.textContent = favoriteCountries.length;

    if (favoriteCountries.length === 0) {
        favoriteContainer.innerHTML =
            '<p class="empty-message">No favourites yet. Save a country you love!</p>';
        return;
    }

    favoriteContainer.innerHTML =
        favoriteCountries.map(createCountryCard).join("");
}


// ==========================================
// COUNTRY DETAILS POPUP
// ==========================================

function showDetails(code) {
    const country = getCountryByCode(code);

    if (!country) return;

    closeDetails();

    const modal = document.createElement("div");

    modal.className = "modal";
    modal.id = "countryModal";

    modal.innerHTML = `
        <div class="modal-content">

            <button class="modal-close"
                onclick="closeDetails()">×</button>

            <div class="flag-container">
                <img
                    src="${escapeHTML(getFlag(country))}"
                    alt="${escapeHTML(country.name)} flag"
                >
            </div>

            <h2>${escapeHTML(country.name)}</h2>

            <p><strong>Capital:</strong>
                ${escapeHTML(getCapital(country))}
            </p>

            <p><strong>Region:</strong>
                ${escapeHTML(country.region || "Not available")}
            </p>

            <p><strong>Subregion:</strong>
                ${escapeHTML(country.subregion || "Not available")}
            </p>

            <p><strong>Population:</strong>
                ${(country.population || 0).toLocaleString()}
            </p>

            <p><strong>Area:</strong>
                ${(country.area || 0).toLocaleString()} km²
            </p>

            <p><strong>Currency:</strong>
                ${escapeHTML(getCurrency(country))}
            </p>

            <p><strong>Languages:</strong>
                ${escapeHTML(getLanguages(country))}
            </p>

            <p><strong>Time Zones:</strong>
                ${escapeHTML((country.timezones || []).join(", ") || "Not available")}
            </p>

            <p><strong>Country Code:</strong>
                ${escapeHTML(code)}
            </p>

        </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeDetails();
        }
    });
}

function closeDetails() {
    document.getElementById("countryModal")?.remove();
}


// ==========================================
// COUNTRY DROPDOWNS
// ==========================================

function fillCountryOptions() {
    const options = countries
        .map(country => `
            <option value="${escapeHTML(country.alpha2Code)}">
                ${escapeHTML(country.name)}
            </option>
        `)
        .join("");

    countryOne.innerHTML =
        '<option value="">Select a country</option>' + options;

    countryTwo.innerHTML =
        '<option value="">Select a country</option>' + options;

    document.getElementById("travelCountry").innerHTML =
        '<option value="">Select a country</option>' + options;
}


// ==========================================
// COUNTRY COMPARISON
// ==========================================

document.getElementById("compareButton")
    .addEventListener("click", compareCountries);

function compareCountries() {
    const first = getCountryByCode(countryOne.value);
    const second = getCountryByCode(countryTwo.value);

    const result = document.getElementById("comparisonResult");

    if (!first || !second) {
        result.innerHTML =
            '<p class="status error">Please select both countries.</p>';
        return;
    }

    if (first.alpha2Code === second.alpha2Code) {
        result.innerHTML =
            '<p class="status error">Please select two different countries.</p>';
        return;
    }

    const rows = [
        ["Capital", getCapital(first), getCapital(second)],
        ["Region", first.region, second.region],
        [
            "Population",
            (first.population || 0).toLocaleString(),
            (second.population || 0).toLocaleString()
        ],
        ["Area", `${(first.area || 0).toLocaleString()} km²`,
            `${(second.area || 0).toLocaleString()} km²`],
        ["Currency", getCurrency(first), getCurrency(second)],
        ["Languages", getLanguages(first), getLanguages(second)]
    ];

    result.innerHTML = `
        <table class="comparison-table">

            <thead>
                <tr>
                    <th>Information</th>
                    <th>${escapeHTML(first.name)}</th>
                    <th>${escapeHTML(second.name)}</th>
                </tr>
            </thead>

            <tbody>
                ${rows.map(row => `
                    <tr>
                        <td>${escapeHTML(row[0])}</td>
                        <td>${escapeHTML(row[1])}</td>
                        <td>${escapeHTML(row[2])}</td>
                    </tr>
                `).join("")}
            </tbody>

        </table>
    `;
}


// ==========================================
// WORLD MAP
// ==========================================

function loadWorldMap() {
    const mapContainer =
        document.getElementById("mapContainer");

    mapContainer.innerHTML = `
        <iframe
            title="Interactive World Map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85"
            loading="lazy">
        </iframe>
    `;
}

loadWorldMap();


// ==========================================
// WEATHER AND LOCAL TIME
// ==========================================

document.getElementById("travelButton")
    .addEventListener("click", exploreTravel);

async function exploreTravel() {
    const code =
        document.getElementById("travelCountry").value;

    const result =
        document.getElementById("travelResult");

    const country = getCountryByCode(code);

    if (!country) {
        result.innerHTML =
            '<p class="status error">Please select a country.</p>';
        return;
    }

    result.innerHTML =
        '<p class="status">Loading weather information...</p>';

    let weatherHTML = "Weather information unavailable.";
    let localTime = "Not available";

    const coordinates = country.latlng;

    if (coordinates && coordinates.length >= 2) {
        const [latitude, longitude] = coordinates;

        try {
            const weatherURL =
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

            const response = await fetch(weatherURL);

            if (!response.ok) {
                throw new Error("Weather API request failed.");
            }

            const weatherData = await response.json();
            const current = weatherData.current;

            weatherHTML = `
                <p><strong>Temperature:</strong>
                    ${current.temperature_2m} °C
                </p>

                <p><strong>Humidity:</strong>
                    ${current.relative_humidity_2m}%
                </p>

                <p><strong>Wind Speed:</strong>
                    ${current.wind_speed_10m} km/h
                </p>
            `;

            localTime = current.time || "Not available";

            // Update map with selected country coordinates
            document.getElementById("mapContainer").innerHTML = `
                <iframe
                    title="Selected Country Location"
                    src="https://www.openstreetmap.org/export/embed.html?marker=${latitude}%2C${longitude}"
                    loading="lazy">
                </iframe>
            `;

        } catch (error) {
            console.error("Weather API Error:", error);
            weatherHTML =
                "Weather data could not be loaded. Please try again.";
        }
    }

    result.innerHTML = `
        <div class="stat-card">

            <h2>${escapeHTML(country.name)}</h2>

            <p><strong>Capital:</strong>
                ${escapeHTML(getCapital(country))}
            </p>

            <p><strong>Local Time:</strong>
                ${escapeHTML(localTime)}
            </p>

            <p><strong>Currency:</strong>
                ${escapeHTML(getCurrency(country))}
            </p>

            <p><strong>Weather:</strong></p>

            ${weatherHTML}

        </div>
    `;
}


// ==========================================
// START THE APPLICATION
// ==========================================

loadCountries();
