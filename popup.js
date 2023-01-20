const { settings } = await chrome.storage.sync.get("settings");
const $checkboxes = document.querySelectorAll('input[type="checkbox"]');

$checkboxes.forEach(($checkbox) => {
  const settingName = $checkbox.id;
  $checkbox.checked = settings[settingName];

  $checkbox.addEventListener("change", async () => {
    settings[settingName] = !settings[settingName];
    await chrome.storage.sync.set({ settings: settings });
  });
});
