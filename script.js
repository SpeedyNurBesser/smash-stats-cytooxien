
const year = document.getElementById("current-year");
year.innerText = new Date().getFullYear();

const playername_display = document.getElementById("playername-display");

const playerhead_display = document.getElementById("playerhead-display");

const search_input = document.getElementById("searchInput");
search_input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        show_stats(search_input.value, true);
    }
});

const rank_points_display = document.getElementById("rank-points-display");
const rank_kills_display = document.getElementById("rank-kills-display");
const rank_wins_display = document.getElementById("rank-wins-display");
const rank_time_display = document.getElementById("rank-time-display");

const points_display = document.getElementById("points-display");
const kills_display = document.getElementById("kills-display");
const wins_display = document.getElementById("wins-display");

const kill_death_ratio_display = document.getElementById("kill-death-display");
const kill_game_ratio_display = document.getElementById("kill-game-display");
const winrate_display = document.getElementById("winrate-display");

const deaths_display = document.getElementById("deaths-display");
const games_display = document.getElementById("games-display");

const time_display = document.getElementById("time-display");

const timeframe_button_global = document.getElementById("timeframe-button-global");
timeframe_button_global.addEventListener("click", () => {
    current_timeframe = "global";
    setActiveTimeframeButton();
    show_stats(search_input.value, false);
});

const timeframe_button_month = document.getElementById("timeframe-button-month");
timeframe_button_month.addEventListener("click", () => {
    current_timeframe = "monthly";
    setActiveTimeframeButton();
    show_stats(search_input.value, false);
});

const timeframe_button_week = document.getElementById("timeframe-button-week");
timeframe_button_week.addEventListener("click", () => {
    current_timeframe = "weekly";
    setActiveTimeframeButton();
    show_stats(search_input.value, false)
});

const timeframe_button_day = document.getElementById("timeframe-button-day");
timeframe_button_day.addEventListener("click", () => {
    current_timeframe = "daily";
    setActiveTimeframeButton();
    show_stats(search_input.value, false);
});

let current_timeframe = "global";

document.getElementById("searchButton").addEventListener("click", () => {
    current_timeframe = "global";
    show_stats(search_input.value, true);
}
);

let recent_players = [];

const recent_table = document.getElementById("recent-table");


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

async function show_stats(query=search_input.value) {
    // Three cases:
    // 1. User exists -> Show stats
    // 2. User exists but has no stats -> Show message
    // 3. User does not exist -> Show error

    fetchUserStats(query)
        .then(data => {
            if (data["status"] == 503) {
                alert("The API is currently unavailable. Please try again later.");
                return false;
            }

            if (data["stats"]["sm"]["global"]["games"] == undefined) {
                alert("User has no stats, i.e. has never played Smash.");
                return false; 
            }

            if (data["stats"]["sm"][current_timeframe]["games"] == undefined) {
                alert(`No stats available for the selected timeframe (${current_timeframe}). Showing global stats instead.`);
                current_timeframe = "global";
                show_stats(query, false);
                setActiveTimeframeButton();
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

            kill_death_ratio_display.innerText = getKDR(data["stats"]["sm"][current_timeframe]["kills"], data["stats"]["sm"][current_timeframe]["deaths"]);
            kill_game_ratio_display.innerText = getKGR(data["stats"]["sm"][current_timeframe]["kills"], data["stats"]["sm"][current_timeframe]["games"]);
            winrate_display.innerText = getWinrate(data["stats"]["sm"][current_timeframe]["wins"], data["stats"]["sm"][current_timeframe]["games"]);

            deaths_display.innerText = data["stats"]["sm"][current_timeframe]["deaths"];
            games_display.innerText = data["stats"]["sm"][current_timeframe]["games"];

            const playtime_ms = data["stats"]["sm"][current_timeframe]["time"];
            time_display.innerText = "They played for " + millisecondsToHumanReadable(playtime_ms);

            playerhead_display.src = `https://mc-heads.net/avatar/${data["playerInfo"]["username"]}/100/.png`;

            const hex_color_code = data["playerInfo"]["rank"]["color"].replace(/§x§/g, "#").replace(/§/g, "");
            playername_display.style.color = hex_color_code;

            localStorage.setItem("last_player", query);

            addToRecentPlayers(data["playerInfo"]["username"], hex_color_code);
            loadRecentTable();
        });
}

function getWinrate(wins, games) {
    if (games === 0) return "0%";
    return ((wins / games) * 100).toFixed(2) + "%";
}

function getKDR(kills, deaths) {
    if (deaths === 0) return `${kills}.0`;
    return (kills / deaths).toFixed(2);
}

function getKGR(kills, games) {
    if (games === 0) return `${kills}.0`;
    return (kills / games).toFixed(2);
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

function setActiveTimeframeButton() {
    const buttons = [
        timeframe_button_global,
        timeframe_button_month,
        timeframe_button_week,
        timeframe_button_day
    ];

    buttons.forEach(button => {
        button.style.borderColor = "black";
    });

    switch (current_timeframe) {
        case "global":
            timeframe_button_global.style.borderColor = "#8b8b8b";
            break;
        case "monthly":
            timeframe_button_month.style.borderColor = "#8b8b8b";
            break;
        case "weekly":
            timeframe_button_week.style.borderColor = "#8b8b8b";
            break;
        case "daily":
            timeframe_button_day.style.borderColor = "#8b8b8b";
            break;
    }
}

function loadRecentTable() {
    recent_table.innerHTML = "";

    for (let player of recent_players) {
        const row = document.createElement("tr");
        row.classList.add("recent-table-row");

        const cell_name = document.createElement("td");
        cell_name.innerText = player["username"];
        cell_name.style.color = player["color"];
        row.appendChild(cell_name);

        const cell_head = document.createElement("td");
        const img = document.createElement("img");
        img.src = `https://mc-heads.net/avatar/${player["username"]}/16/.png`;
        img.classList.add("recent-playerhead-display");
        cell_head.appendChild(img);
        row.appendChild(cell_head);

        row.addEventListener("click", () => {
            current_timeframe = "global";
            setActiveTimeframeButton();
            search_input.value = player["username"];
            show_stats();
            window.scrollTo(0, 0, "smooth");
        });

        recent_table.appendChild(row);
    }
}

function addToRecentPlayers(username, color) {
    recent_players = [{
        "username": username,
        "color": color
    }].concat(recent_players);

    recent_players = recent_players.filter((player, index, self) =>
        index === self.findIndex((p) => (
            p.username === player.username
        ))
    );

    recent_players = recent_players.slice(0, 10);

    localStorage.setItem("recent_players", JSON.stringify(recent_players));
}

document.addEventListener("DOMContentLoaded", () => {
    search_input.value = localStorage.getItem("last_player") || "SpeedyOnlyBetter";
    show_stats();

    recent_players = JSON.parse(localStorage.getItem("recent_players")) || [
    {
        "username": "SpeedyOnlyBetter",
        "color": "#9097a0"
    }
];
    loadRecentTable();
});