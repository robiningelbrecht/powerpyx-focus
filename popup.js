const { settings } = await chrome.storage.sync.get("settings");
const $enableDarkMode = document.querySelector("input#dark-mode");
$enableDarkMode.checked = settings.enableDarkMode;

$enableDarkMode.addEventListener("change", async () => {
  settings.enableDarkMode = !settings.enableDarkMode;
  await chrome.storage.sync.set({ settings: settings });
});
