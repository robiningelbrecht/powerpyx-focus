const green = '#2a9d8f';
const red = '#e63946';
chrome.runtime.onInstalled.addListener(async () => {
    await chrome.action.setBadgeText({
        text: " ",
    });
    await chrome.action.setBadgeBackgroundColor({color: red});

    chrome.storage.local.set({ focusModeEnabled: false });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.url) {
        return;
    }
    if (!tab.url.startsWith('https://www.powerpyx.com')) {
        return;
    }

    chrome.storage.sync.get("focusModeEnabled").then(async ({ focusModeEnabled }) => {
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: ' ',
        });

        if (focusModeEnabled) {
            await chrome.action.setBadgeBackgroundColor({color: green});
            await chrome.scripting.insertCSS({
                files: ["focus-mode.css"],
                target: { tabId: tab.id, allFrames: true },
            });

            return;
        }

        await chrome.action.setBadgeBackgroundColor({color: red});
        await chrome.scripting.removeCSS({
            files: ["focus-mode.css"],
            target: { tabId: tab.id, allFrames: true },
        });
    });
});

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.startsWith('https://www.powerpyx.com')) {
        return;
    }

    chrome.storage.sync.get("focusModeEnabled").then(async ({ focusModeEnabled }) => {
        // Next state will always be the opposite
        const nextState = !focusModeEnabled;

        // Set the action badge to the next state
        await chrome.action.setBadgeText({
            tabId: tab.id,
            text: ' ',
        });

        chrome.storage.sync.set({ focusModeEnabled: nextState }).then(async () => {
            if (nextState) {
                await chrome.action.setBadgeBackgroundColor({color: green});
                await chrome.scripting.insertCSS({
                    files: ["focus-mode.css"],
                    target: { tabId: tab.id, allFrames: true },
                });

                return;
            }

            await chrome.action.setBadgeBackgroundColor({color: red});
            await chrome.scripting.removeCSS({
                files: ["focus-mode.css"],
                target: { tabId: tab.id, allFrames: true },
            });
        });


    });
});