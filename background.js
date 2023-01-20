chrome.runtime.onInstalled.addListener(async () => {
  await initialize();
});

chrome.management.onEnabled.addListener(async () => {
  await initialize();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(async (tab) => {
        await applySettings(tab);
      });
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!urlMatchesPowerpyx(tab.url)) {
    return;
  }

  await injectCss(tab);
  await applySettings(tab);
  await setIconStatus(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);

  await setIconStatus(tab);
});

const initialize = async () => {
  const settings = { enableDarkMode: false, enableFullWidth: false };
  await setChromeStorageSync({ settings: settings });

  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(async (tab) => {
      await injectCss(tab);
    });
  });
};

const injectCss = async (tab) => {
  if (!urlMatchesPowerpyx(tab.url)) {
    return;
  }

  await chrome.scripting.insertCSS({
    files: ["focus-mode.css"],
    target: { tabId: tab.id },
  });
};

const applySettings = async (tab) => {
  if (!urlMatchesPowerpyx(tab.url)) {
    return;
  }

  const settings = await getChromeStorageSync("settings");
  if (settings.enableDarkMode) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.body.classList.add("dark");
      },
    });
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.body.classList.remove("dark");
      },
    });
  }

  if (settings.enableFullWidth) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.body.classList.add("full-width");
      },
    });
  } else {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.body.classList.remove("full-width");
      },
    });
  }
};

const setIconStatus = async (tab) => {
  if (!urlMatchesPowerpyx(tab.url)) {
    await chrome.action.disable();
    await chrome.action.setBadgeText({
      text: "",
      tabId: tab.id,
    });

    return;
  }

  await chrome.action.enable();
  await chrome.action.setBadgeText({
    text: "ON",
    tabId: tab.id,
  });
  await chrome.action.setBadgeBackgroundColor({
    color: "#2a9d8f",
    tabId: tab.id,
  });
};

const urlMatchesPowerpyx = (url) => {
  return (
    url &&
    url !== "https://www.powerpyx.com/" &&
    url.startsWith("https://www.powerpyx.com/")
  );
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
