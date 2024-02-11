export function execute<T>(tab: chrome.tabs.Tab, fn: (...arg: any[]) => T, ...args: any[]) {
  return chrome.scripting.executeScript({
    target : {tabId: tab.id!},
    func: fn,
    args,
  });
}

export async function findActiveTab() {
  const allTabs = await chrome.tabs.query({});
  const filtered = allTabs.filter(it => it.active === true);
  if (filtered.length !== 1) {
    throw Error("active tab is not only 1");
  }
  return filtered[0];
}
