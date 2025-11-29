
const year = document.getElementById("current-year");
year.innerText = new Date().getFullYear();

const playername_display = document.getElementById("playername-display");

const search_input = document.getElementById("searchInput");
search_input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        show_stats();
    }
});

const rank_points_display = document.getElementById("rank-points-display");
const rank_kills_display = document.getElementById("rank-kills-display");
const rank_wins_display = document.getElementById("rank-wins-display");
const rank_time_display = document.getElementById("rank-time-display");

const points_display = document.getElementById("points-display");
const kills_display = document.getElementById("kills-display");
const wins_display = document.getElementById("wins-display");

const deaths_display = document.getElementById("deaths-display");
const games_display = document.getElementById("games-display");

const time_display = document.getElementById("time-display");

const timeframe_button_global = document.getElementById("timeframe-button-global");
timeframe_button_global.addEventListener("click", () => {
    current_timeframe = "global";
    show_stats();
});

const timeframe_button_month = document.getElementById("timeframe-button-month");
timeframe_button_month.addEventListener("click", () => {
    current_timeframe = "monthly";
    show_stats();
});

const timeframe_button_week = document.getElementById("timeframe-button-week");
timeframe_button_week.addEventListener("click", () => {
    current_timeframe = "weekly";
    show_stats()
});

const timeframe_button_day = document.getElementById("timeframe-button-day");
timeframe_button_day.addEventListener("click", () => {
    current_timeframe = "daily"
    show_stats();
});

let current_timeframe = "global";

document.getElementById("searchButton").addEventListener("click", () => {
    current_timeframe = "global";
    show_stats();
}
);

async function fetchUserStats(username) {
    const promise = new Promise((resolve, reject) => {
        fetch("https://api.cytooxien.de/user/" + username)
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                alert("There is no player by that name.")
                reject({
                    "status": 503,
                    "message": error
                });
            });
    });
    return promise;
}

async function show_stats() {
    // Three cases:
    // 1. User exists -> Show stats
    // 2. User exists but has no stats -> Show message
    // 3. User does not exist -> Show error

    const query = search_input.value;
    fetchUserStats(query)
        .then(data => {
            if (data["status"] == 503) {
                alert("The API is currently unavailable. Please try again later.");
                return;
            }

            if (data["stats"]["sm"][current_timeframe]["games"] == undefined) {
                alert("User has no stats for the selected timeframe.");
                return;
            }

            playername_display.innerText = data["playerInfo"]["username"];

            rank_points_display.innerText = `${data["stats"]["sm"][current_timeframe]["rank_points"]}`;
            points_display.innerText = `(${data["stats"]["sm"][current_timeframe]["points"]})`;

            rank_kills_display.innerText = `${data["stats"]["sm"][current_timeframe]["rank_kills"]}`;
            kills_display.innerText = `(${data["stats"]["sm"][current_timeframe]["kills"]})`;

            rank_wins_display.innerText = `${data["stats"]["sm"][current_timeframe]["rank_wins"]}`;
            wins_display.innerText = `(${data["stats"]["sm"][current_timeframe]["wins"]})`;

            rank_time_display.innerText = `${data["stats"]["sm"][current_timeframe]["rank_time"]}`;

            deaths_display.innerText = data["stats"]["sm"][current_timeframe]["deaths"];
            games_display.innerText = data["stats"]["sm"][current_timeframe]["games"];

            const playtime_ms = data["stats"]["sm"][current_timeframe]["time"];
            time_display.innerText = "They played for " + millisecondsToHumanReadable(playtime_ms);
        });
}

function millisecondsToHumanReadable(ms) {
    if (ms < 0) return "Invalid input";

    const days = Math.floor(ms / 86400000);
    ms %= 86400000;

    const hours = Math.floor(ms / 3600000);
    ms %= 3600000;

    const minutes = Math.floor(ms / 60000);
    ms %= 60000;

    let result = "";

    if (days > 1) result += `${days} days `;
    else if (days > 0) result += `${days} day `;

    if (hours > 1) result += `${hours} hours `;
    else if (hours > 0) result += `${hours} hour `;

    if (minutes == 1) result += `${minutes} minute`;
    else result += `${minutes} minutes`;


    return result.trim();
}