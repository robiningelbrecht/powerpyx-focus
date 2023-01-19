chrome.runtime.onInstalled.addListener(async () => {
  const settings = { enableDarkMode: false };
  await setChromeStorageSync({ settings: settings });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach((tab) => {
        handleFocusMode(tab);
      });
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  handleFocusMode(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);

  handleFocusMode(tab);
});

const handleFocusMode = async (tab) => {
  if (
    tab.url &&
    tab.url !== "https://www.powerpyx.com/" &&
    tab.url.startsWith("https://www.powerpyx.com/")
  ) {
    const settings = await getChromeStorageSync("settings");

    await chrome.action.enable();
    await chrome.action.setBadgeText({
      text: "ON",
      tabId: tab.id,
    });
    await chrome.action.setBadgeBackgroundColor({
      color: "#2a9d8f",
      tabId: tab.id,
    });

    await chrome.scripting.insertCSS({
      files: ["focus-mode.css"],
      target: { tabId: tab.id },
    });

    if (settings.enableDarkMode) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.body.classList.add("dark");
        },
      });
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.body.classList.remove("dark");
        },
      });
    }

    return;
  }

  await chrome.action.disable();
  await chrome.action.setBadgeText({
    text: "",
    tabId: tab.id,
  });
};

const getChromeStorageSync = async function (key) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(key, function (value) {
        resolve(value[key]);
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

const setChromeStorageSync = async function (obj) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.set(obj, function () {
        resolve();
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
