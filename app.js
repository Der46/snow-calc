const POINT_PER_COIN = 26;
const STORAGE_KEY = "snowAvalancheProgressCalculatorV3";
const LANGUAGE_STORAGE_KEY = "snowAvalancheProgressCalculatorLanguage";
const I18N_JSON_PATH = "i18n.json";

let languageMeta = {};
let i18n = {};
let currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "zh-Hant";

const rewards = [
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

const inputIds = ["myScore", "teammateScore", "myCoins", "teammateCoins"];
const maxThreshold = rewards.at(-1).threshold;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const byId = (id) => document.getElementById(id);

const loadI18nJson = async () => {
    try {
        const response = await fetch(I18N_JSON_PATH, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Failed to load ${I18N_JSON_PATH}: ${response.status}`);
        }

        const data = await response.json();

        languageMeta = data.languageMeta ?? {};
        i18n = data.i18n ?? {};

        if (!i18n[currentLang]) {
            currentLang = "zh-Hant";
            localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
        }
    } catch (error) {
        console.error("i18n.json load failed:", error);

        languageMeta = {};
        i18n = {};

        currentLang = "zh-Hant";
    }
};


const t = (key, params = {}) => {
    const langPack = i18n[currentLang] ?? i18n["zh-Hant"] ?? {};
    const fallbackPack = i18n["zh-Hant"] ?? {};
    let text = langPack[key] ?? fallbackPack[key] ?? key;

    const mergedParams = {
        year: new Date().getFullYear(),
        ...params
    };

    Object.entries(mergedParams).forEach(([name, value]) => {
        text = text.replaceAll(`{${name}}`, String(value));
    });

    return text;
};

const getLocale = () => languageMeta[currentLang]?.locale ?? "zh-Hant-TW";

const getTimeZone = () => languageMeta[currentLang]?.timeZone ?? "Asia/Taipei";

const applyI18n = () => {
    document.documentElement.lang = currentLang;
    document.title = t("pageTitle");

    $$("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        element.textContent = t(key);
    });
};

const initLanguage = () => {
    if (!i18n[currentLang]) {
        currentLang = "zh-Hant";
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
    }

    const languageSelect = byId("languageSelect");

    if (!languageSelect) return;

    languageSelect.value = currentLang;

    languageSelect.addEventListener("change", () => {
        currentLang = languageSelect.value;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);

        applyI18n();
        calculate();
    });

    applyI18n();
};

const getRewardName = (item) => t(item.rewardKey);

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
    const nextThreshold = completed ? maxThreshold : nextReward.threshold;

    let needScore = 0;
    let actualCoins = 0;
    let stagePercent = 100;

    if (!completed) {
        needScore = Math.max(0, nextThreshold - score);
        actualCoins = Math.ceil(needScore / POINT_PER_COIN);

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
            <div class="reward-dot">${item.icon}</div>
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
    const forecastAddScore = remainingCoins * POINT_PER_COIN;
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

    const currentRailPercent = current.railPercent;
    const forecastRailPercent = forecast.railPercent;
    const forecastExtraPercent = Math.max(0, forecastRailPercent - currentRailPercent);

    const railFill = byId("railFill");
    const railForecastFill = byId("railForecastFill");
    const stageFill = byId("stageFill");
    const stagePercent = byId("stagePercent");
    const railStatusText = byId("railStatusText");

    if (railFill) {
        railFill.style.left = "0%";
        railFill.style.width = `${currentRailPercent}%`;
    }

    if (railForecastFill) {
        railForecastFill.style.left = `${currentRailPercent}%`;
        railForecastFill.style.width = `${forecastExtraPercent}%`;
    }

    if (stageFill) {
        stageFill.style.width = `${current.stagePercent}%`;
    }

    if (stagePercent) {
        stagePercent.textContent = `${formatDecimal(current.stagePercent, 1)}%`;
    }

    if (railStatusText) {
        railStatusText.textContent = t("railStatus", {
            current: formatDecimal(current.railPercent, 1),
            forecast: formatDecimal(forecast.railPercent, 1)
        });
    }

    updateCurrentSection(data, current);
    updateForecastSection(data, forecast);
};

const updateCurrentSection = (data, current) => {
    byId("currentTotalScoreText").textContent = formatFloor(data.totalScore);
    byId("currentLevelText").textContent = `${current.currentLevel} / ${rewards.length}`;

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
    byId("forecastLevelText").textContent = `${forecast.currentLevel} / ${rewards.length}`;

    if (forecast.completed) {
        byId("forecastNeedText").textContent = t("completed");
        return;
    }

    const forecastNeedCoins = Math.ceil(forecast.needScore / POINT_PER_COIN);

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

    const fragment = document.createDocumentFragment();

    steps.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        fragment.appendChild(li);
    });

    strategyList.appendChild(fragment);
};

const resetAll = () => {
    inputIds.forEach((id) => {
        const input = byId(id);
        if (input) input.value = 0;
    });

    localStorage.removeItem(STORAGE_KEY);
    calculate();
};

window.resetAll = resetAll;

const saveState = () => {
    const state = inputIds.reduce((acc, id) => {
        acc[id] = byId(id)?.value ?? 0;
        return acc;
    }, {});

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const loadState = () => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return;

    try {
        const state = JSON.parse(raw);

        inputIds.forEach((id) => {
            const input = byId(id);

            if (input && state[id] !== undefined) {
                input.value = state[id];
            }
        });
    } catch (error) {
        console.warn(t("loadStorageFailed"), error);
    }
};

const bindInputs = () => {
    inputIds.forEach((id) => {
        const input = byId(id);
        if (!input) return;

        input.addEventListener("input", calculate);
        input.addEventListener("change", calculate);
    });
};

const initApp = async () => {
    await loadI18nJson();

    loadState();
    initLanguage();
    bindInputs();
    calculate();
};

document.addEventListener("DOMContentLoaded", initApp);
