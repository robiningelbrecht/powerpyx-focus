chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    handleFocusMode(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    handleFocusMode(tab);
});

const handleFocusMode = async (tab) => {
    if (tab.url && tab.url !== 'https://www.powerpyx.com/' && tab.url.startsWith('https://www.powerpyx.com/')) {
        await chrome.action.setBadgeText({
            text: "ON",
            tabId: tab.id,
        });
        await chrome.action.setBadgeBackgroundColor({ 
            color: '#2a9d8f',
            tabId: tab.id,
        });

        await chrome.scripting.insertCSS({
            files: ["focus-mode.css"],
            target: { tabId: tab.id },
        });
        return;
    }


    await chrome.action.setBadgeText({
        text: "",
        tabId: tab.id,
    });
};