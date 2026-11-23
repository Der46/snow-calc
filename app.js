const LANGUAGE_STORAGE_KEY = "snowAvalancheProgressCalculatorLanguage";
const MODE_STORAGE_KEY = "eventCalculatorMode";
const SPEED_ROUND_STORAGE_KEY = "speedStarsCalculatorRound";
const I18N_JSON_PATH = "i18n.json";

let languageMeta = {};
let i18n = {};
let modeI18n = {};
let currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "zh-Hant";

const spins = (n) => ({ rewardKey: "rewardSpinsN", params: { n } });
const speedies = (n) => ({ rewardKey: "rewardSpeediesN", params: { n } });
const thunder = (n) => ({ rewardKey: "rewardThunderCoinN", params: { n } });

const avalancheRewards = [
    { threshold: 4000, rewardKey: "rewardGoldenHammer", icon: "🔨" },
    { threshold: 12000, rewardKey: "reward400Energy", icon: "🔋" },
    { threshold: 27000, rewardKey: "reward300SnowCoins", icon: "❄️" },
    { threshold: 55000, rewardKey: "rewardThunderCoin1", icon: "⚡" },
    { threshold: 90000, rewardKey: "reward2500Energy", icon: "🔋" },
    { threshold: 135000, rewardKey: "rewardSnowGlobeBox", icon: "🎄" },
    { threshold: 195000, rewardKey: "reward5000Energy", icon: "🔋" },
    { threshold: 275000, rewardKey: "rewardSilverThunderBox", icon: "🎁" },
    { threshold: 375000, rewardKey: "rewardRedCrownChest", icon: "👑" },
    { threshold: 495000, rewardKey: "reward10000Energy", icon: "🔋" },
    { threshold: 635000, rewardKey: "rewardThunderCoin4", icon: "⚡" },
    { threshold: 825000, rewardKey: "reward25000Energy", icon: "🔋" },
    { threshold: 1095000, rewardKey: "reward35000Energy", icon: "🔋" },
    { threshold: 1495000, rewardKey: "rewardRoyalThunderBox", icon: "🏆" },
    { threshold: 2095000, rewardKey: "reward80000Energy", icon: "🔋" }
];

const speedRewards = {
    1: [
        { threshold: 1800, rewardKey: "rewardSeasonalBigGoldenChest", icon: "🧰" },
        { threshold: 6000, ...spins(200), icon: "🔋" },
        { threshold: 14000, ...thunder(1), icon: "⚡" },
        { threshold: 60000, ...speedies(300), icon: "🏁" },
        { threshold: 80000, rewardKey: "rewardPumpkinHalloweenChest", icon: "🎃" },
        { threshold: 115000, rewardKey: "rewardMysteryChest2", icon: "❓" },
        { threshold: 160000, ...spins(2500), icon: "🔋" },
        { threshold: 230000, rewardKey: "rewardCrazyHalloweenChest", icon: "😈" },
        { threshold: 400000, ...spins(5000), icon: "🔋" },
        { threshold: 600000, ...spins(20000), icon: "🔋" }
    ],
    2: [
        { threshold: 10000, rewardKey: "rewardSmallHalloweenChest", icon: "🎃" },
        { threshold: 30000, ...speedies(100), icon: "🏁" },
        { threshold: 60000, ...thunder(1), icon: "⚡" },
        { threshold: 120000, rewardKey: "rewardSmallHalloweenChest", icon: "🎃" },
        { threshold: 190000, ...spins(1500), icon: "🔋" },
        { threshold: 300000, ...spins(2000), icon: "🔋" },
        { threshold: 450000, rewardKey: "rewardBlueChest", icon: "🧊" },
        { threshold: 650000, ...spins(3500), icon: "🔋" },
        { threshold: 1000000, rewardKey: "rewardHalloweenChest", icon: "🎃" },
        { threshold: 1300000, ...spins(10000), icon: "🔋" },
        { threshold: 1700000, ...thunder(4), icon: "🏆" }
    ],
    3: [
        { threshold: 10000, rewardKey: "rewardPinataGuitar", icon: "🎸" },
        { threshold: 30000, ...speedies(150), icon: "🏁" },
        { threshold: 60000, ...thunder(1), icon: "⚡" },
        { threshold: 120000, ...spins(500), icon: "🔋" },
        { threshold: 190000, rewardKey: "rewardPinata", icon: "🪅" },
        { threshold: 300000, rewardKey: "rewardFlameChest", icon: "🔥" },
        { threshold: 450000, ...spins(3000), icon: "🔋" },
        { threshold: 650000, rewardKey: "rewardSpinsChest", icon: "🧰" },
        { threshold: 1000000, ...spins(7000), icon: "🔋" },
        { threshold: 1300000, rewardKey: "rewardRedCrownChest", icon: "👑" },
        { threshold: 1700000, rewardKey: "rewardMediumThunderBox", icon: "🏆" }
    ]
};

const MODES = {
    avalanche: {
        pointPerCoin: 26,
        themeColor: "#3aa8ef",
        rounds: { 1: avalancheRewards },
        storageKey: () => "snowAvalancheProgressCalculatorV3"
    },
    speed: {
        pointPerCoin: 26,
        themeColor: "#ffc21a",
        rounds: speedRewards,
        storageKey: (round) => `speedStarsCalculatorV1:r${round}`
    }
};

let currentMode = MODES[localStorage.getItem(MODE_STORAGE_KEY)] ? localStorage.getItem(MODE_STORAGE_KEY) : "avalanche";
let currentRound = Number(localStorage.getItem(SPEED_ROUND_STORAGE_KEY)) || 1;

const inputIds = ["myScore", "teammateScore", "myCoins", "teammateCoins"];

const $$ = (selector) => document.querySelectorAll(selector);
const byId = (id) => document.getElementById(id);

const getModeConfig = () => MODES[currentMode];
const getRound = () => (currentMode === "speed" ? currentRound : 1);
const getRewards = () => getModeConfig().rounds[getRound()];
const getPointPerCoin = () => getModeConfig().pointPerCoin;

const loadI18nJson = async () => {
    try {
        const response = await fetch(I18N_JSON_PATH, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`Failed to load ${I18N_JSON_PATH}: ${response.status}`);
        }

        const data = await response.json();

        languageMeta = data.languageMeta ?? {};
        i18n = data.i18n ?? {};
        modeI18n = data.modeI18n ?? {};
    } catch (error) {
        console.error("i18n.json load failed:", error);
        languageMeta = {};
        i18n = {};
        modeI18n = {};
    }

    if (!i18n[currentLang]) {
        currentLang = "zh-Hant";
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
    }
};

const getLocale = () => languageMeta[currentLang]?.locale ?? "zh-Hant-TW";

const t = (key, params = {}) => {
    const modePacks = modeI18n[currentMode] ?? {};
    let text =
        modePacks[currentLang]?.[key] ??
        i18n[currentLang]?.[key] ??
        modePacks["zh-Hant"]?.[key] ??
        i18n["zh-Hant"]?.[key] ??
        key;

    const mergedParams = {
        year: new Date().getFullYear(),
        rate: getPointPerCoin(),
        ...params
    };

    Object.entries(mergedParams).forEach(([name, value]) => {
        const shown = typeof value === "number" && name !== "year"
            ? value.toLocaleString(getLocale())
            : String(value);
        text = text.replaceAll(`{${name}}`, shown);
    });

    return text;
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applyI18n = () => {
    document.documentElement.lang = currentLang;
    document.title = t("pageTitle");

    $$("[data-i18n]").forEach((element) => {
        element.textContent = t(element.dataset.i18n);
    });

    // Bold selected terms (e.g. "LINE|@CSL") without injecting HTML
    $$("[data-i18n-strong]").forEach((element) => {
        const terms = element.dataset.i18nStrong.split("|");
        const parts = element.textContent.split(new RegExp(`(${terms.map(escapeRegExp).join("|")})`));
        element.replaceChildren(...parts.filter(Boolean).map((part) => {
            if (!terms.includes(part)) return document.createTextNode(part);
            const strong = document.createElement("strong");
            strong.textContent = part;
            return strong;
        }));
    });

    $$("[data-i18n-label]").forEach((element) => {
        element.setAttribute("aria-label", t(element.dataset.i18nLabel));
    });

    $$("[data-round]").forEach((button) => {
        button.textContent = t("roundTab", { n: Number(button.dataset.round) });
    });
};

const getRewardName = (item) => t(item.rewardKey, item.params);

const getNumber = (id) => {
    const value = Number(byId(id)?.value ?? 0);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
};

const formatInt = (value) => Math.ceil(value).toLocaleString(getLocale());

const formatFloor = (value) => Math.floor(value).toLocaleString(getLocale());

const formatDecimal = (value, digits) => Number(value).toLocaleString(getLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getProgressData = (score) => {
    const rewards = getRewards();
    const pointPerCoin = getPointPerCoin();
    let currentLevel = 0;
    let nextReward = null;

    for (const [index, reward] of rewards.entries()) {
        if (score >= reward.threshold) {
            currentLevel = index + 1;
        } else {
            nextReward = reward;
            break;
        }
    }

    const completed = nextReward === null;
    const previousThreshold = currentLevel > 0 ? rewards[currentLevel - 1].threshold : 0;
    const nextThreshold = completed ? rewards.at(-1).threshold : nextReward.threshold;

    let needScore = 0;
    let actualCoins = 0;
    let stagePercent = 100;

    if (!completed) {
        needScore = Math.max(0, nextThreshold - score);
        actualCoins = Math.ceil(needScore / pointPerCoin);

        const stageTotal = nextThreshold - previousThreshold;
        const stageNow = score - previousThreshold;

        stagePercent = clamp((stageNow / stageTotal) * 100, 0, 100);
    }

    const railPercent = completed
        ? 100
        : clamp(((currentLevel + stagePercent / 100) / rewards.length) * 100, 0, 100);

    return {
        score,
        currentLevel,
        nextReward,
        completed,
        previousThreshold,
        nextThreshold,
        needScore,
        actualCoins,
        stagePercent,
        railPercent
    };
};

const renderRewardRail = (currentScore, forecastScore, currentNextReward, forecastLevel) => {
    const rewardList = byId("rewardList");
    if (!rewardList) return;

    const rewards = getRewards();
    rewardList.closest(".reward-rail")?.style.setProperty("--steps", rewards.length);
    rewardList.innerHTML = "";

    const fragment = document.createDocumentFragment();

    rewards.forEach((item, index) => {
        const done = currentScore >= item.threshold;
        const forecast = !done && forecastScore >= item.threshold;
        const isNext = currentNextReward === item;
        const isForecastTarget = forecastLevel === index + 1 && forecast;

        const div = document.createElement("div");
        div.className = "reward-step";

        div.classList.toggle("done", done);
        div.classList.toggle("forecast", forecast);
        div.classList.toggle("next", isNext);
        div.classList.toggle("forecast-target", isForecastTarget);

        div.innerHTML = `
            <div class="reward-dot" aria-hidden="true">${item.icon}</div>
            <div class="reward-name">${getRewardName(item)}</div>
            <div class="reward-threshold">${formatFloor(item.threshold)}</div>
        `;

        fragment.appendChild(div);
    });

    rewardList.appendChild(fragment);
};

const calculate = () => {
    const myScore = getNumber("myScore");
    const teammateScore = getNumber("teammateScore");
    const myCoins = getNumber("myCoins");
    const teammateCoins = getNumber("teammateCoins");

    const totalScore = myScore + teammateScore;
    const remainingCoins = myCoins + teammateCoins;
    const forecastAddScore = remainingCoins * getPointPerCoin();
    const forecastScore = totalScore + forecastAddScore;

    const currentData = getProgressData(totalScore);
    const forecastData = getProgressData(forecastScore);

    updateResult({
        totalScore,
        remainingCoins,
        forecastAddScore,
        forecastScore,
        currentData,
        forecastData
    });

    updateStrategySuggestion(remainingCoins);

    renderRewardRail(
        totalScore,
        forecastScore,
        currentData.nextReward,
        forecastData.currentLevel
    );

    saveState();
};

const updateResult = (data) => {
    const { currentData: current, forecastData: forecast } = data;

    const forecastExtraPercent = Math.max(0, forecast.railPercent - current.railPercent);

    byId("railFill").style.width = `${current.railPercent}%`;
    byId("railForecastFill").style.left = `${current.railPercent}%`;
    byId("railForecastFill").style.width = `${forecastExtraPercent}%`;

    byId("stageFill").style.width = `${current.stagePercent}%`;
    byId("stagePercent").textContent = `${formatDecimal(current.stagePercent, 1)}%`;
    byId("railStatusText").textContent = t("railStatus", {
        current: formatDecimal(current.railPercent, 1),
        forecast: formatDecimal(forecast.railPercent, 1)
    });

    updateCurrentSection(data, current);
    updateForecastSection(data, forecast);
};

const updateCurrentSection = (data, current) => {
    const total = getRewards().length;

    byId("currentTotalScoreText").textContent = formatFloor(data.totalScore);
    byId("currentLevelText").textContent = `${current.currentLevel} / ${total}`;

    if (current.completed) {
        byId("needScoreText").textContent = "0";
        byId("actualCoinsText").textContent = "0";
        byId("nextThresholdText").textContent = t("completed");
        byId("stageTitle").textContent = t("allCompletedStage");
        return;
    }

    byId("needScoreText").textContent = formatInt(current.needScore);
    byId("actualCoinsText").textContent = formatInt(current.actualCoins);
    byId("nextThresholdText").textContent = formatFloor(current.nextThreshold);

    byId("stageTitle").textContent = t("nextStage", {
        reward: getRewardName(current.nextReward)
    });
};

const updateForecastSection = (data, forecast) => {
    byId("forecastAddScoreText").textContent = formatFloor(data.forecastAddScore);
    byId("forecastTotalScoreText").textContent = formatFloor(data.forecastScore);
    byId("forecastLevelText").textContent = `${forecast.currentLevel} / ${getRewards().length}`;

    if (forecast.completed) {
        byId("forecastNeedText").textContent = t("completed");
        return;
    }

    const forecastNeedCoins = Math.ceil(forecast.needScore / getPointPerCoin());

    byId("forecastNeedText").textContent =
        `${formatInt(forecast.needScore)} ${t("scoreUnit")} / ${formatInt(forecastNeedCoins)} ${t("coinUnit")}`;
};

const updateStrategySuggestion = (remainingCoins) => {
    const strategyStatusText = byId("strategyStatusText");
    const strategyList = byId("strategyList");

    if (!strategyStatusText || !strategyList) return;

    strategyList.innerHTML = "";

    let statusKey = "strategyStatusLow";
    let steps = [];

    if (remainingCoins >= 5000) {
        statusKey = "strategyStatusHigh";
        steps = [
            t("strategyStep1xTimes", { times: 10 }),
            t("strategyStep3xTimes", { times: 10 }),
            t("strategyStep10xTimes", { times: 10 }),
            t("strategyStep30xTimes", { times: 5 }),
            t("strategyStep50xUntil")
        ];
    } else if (remainingCoins >= 2000) {
        statusKey = "strategyStatusMedium";
        steps = [
            t("strategyStep1xTimes", { times: 8 }),
            t("strategyStep3xTimes", { times: 8 }),
            t("strategyStep10xUntil")
        ];
    }

    strategyStatusText.textContent = t(statusKey);
    strategyList.hidden = steps.length === 0;

    const fragment = document.createDocumentFragment();

    steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        fragment.appendChild(li);
    });

    strategyList.appendChild(fragment);
};

/* State: one saved slot per mode (and per round for Speed Stars) */

const getStorageKey = () => getModeConfig().storageKey(getRound());

const saveState = () => {
    const state = inputIds.reduce((acc, id) => {
        acc[id] = byId(id)?.value ?? 0;
        return acc;
    }, {});

    localStorage.setItem(getStorageKey(), JSON.stringify(state));
};

const loadState = () => {
    let state = {};

    try {
        state = JSON.parse(localStorage.getItem(getStorageKey()) || "{}") ?? {};
    } catch (error) {
        console.warn(t("loadStorageFailed"), error);
    }

    inputIds.forEach((id) => {
        const input = byId(id);
        if (input) input.value = state[id] ?? 0;
    });
};

const resetAll = () => {
    inputIds.forEach((id) => {
        const input = byId(id);
        if (input) input.value = 0;
    });

    localStorage.removeItem(getStorageKey());
    calculate();
};

/* Mode & round switching */

const syncHash = () => {
    const hash = currentMode === "speed" ? `#speed-${currentRound}` : "#avalanche";
    if (location.hash !== hash) history.replaceState(null, "", hash);
};

const readHash = () => {
    const match = location.hash.match(/^#(avalanche|speed)(?:-(\d))?$/);
    if (!match) return;

    currentMode = match[1];
    const round = Number(match[2]);
    if (MODES.speed.rounds[round]) currentRound = round;
};

const renderSwitches = () => {
    document.documentElement.dataset.mode = currentMode;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getModeConfig().themeColor);

    $$("[data-mode-tab]").forEach((tab) => {
        const active = tab.dataset.modeTab === currentMode;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
    });

    const roundSwitch = byId("roundSwitch");
    if (roundSwitch) roundSwitch.hidden = currentMode !== "speed";

    $$("[data-round]").forEach((tab) => {
        const active = Number(tab.dataset.round) === currentRound;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
    });
};

const refreshView = () => {
    renderSwitches();
    loadState();
    applyI18n();
    calculate();
    syncHash();
};

const switchTo = (mode, round = currentRound) => {
    if (mode === currentMode && round === currentRound) return;

    saveState();
    currentMode = mode;
    currentRound = round;

    localStorage.setItem(MODE_STORAGE_KEY, currentMode);
    localStorage.setItem(SPEED_ROUND_STORAGE_KEY, String(currentRound));

    refreshView();
};

const bindTablist = (container, onPick) => {
    if (!container) return;

    const tabs = () => [...container.querySelectorAll('[role="tab"]')];

    container.addEventListener("click", (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (tab) onPick(tab);
    });

    container.addEventListener("keydown", (event) => {
        const list = tabs();
        const index = list.indexOf(document.activeElement);
        if (index < 0) return;

        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!step) return;

        event.preventDefault();
        const next = list[(index + step + list.length) % list.length];
        onPick(next);
        next.focus();
    });
};

const bindControls = () => {
    inputIds.forEach((id) => {
        byId(id)?.addEventListener("input", calculate);
    });

    byId("clearButton")?.addEventListener("click", resetAll);

    bindTablist(byId("modeSwitch"), (tab) => switchTo(tab.dataset.modeTab));
    bindTablist(byId("roundSwitch"), (tab) => switchTo("speed", Number(tab.dataset.round)));

    window.addEventListener("hashchange", () => {
        saveState();
        readHash();
        refreshView();
    });

    const languageSelect = byId("languageSelect");
    if (!languageSelect) return;

    languageSelect.value = currentLang;
    languageSelect.addEventListener("change", () => {
        currentLang = languageSelect.value;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
        applyI18n();
        calculate();
    });
};

const initApp = async () => {
    await loadI18nJson();

    if (!MODES.speed.rounds[currentRound]) currentRound = 1;
    readHash();

    bindControls();
    refreshView();
};

document.addEventListener("DOMContentLoaded", initApp);
