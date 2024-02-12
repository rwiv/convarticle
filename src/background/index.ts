import {Arg, disableCodeTag, re} from "@src/background/convert_article";
import {execute, findActiveTab} from "@src/background/background_utils";
import {AppConfigs, appConfigs} from "@src/config/app_configs";

chrome.commands.onCommand.addListener(async (command) => {
  const target = await findActiveTab();

  const { temp1, temp2, targetWords } = appConfigs.storageKey;
  const targetWordValue = await chrome.storage.local.get([targetWords]).then(async data => {
    let value = data[targetWords];
    if (value === undefined) {
      value = [];
      await chrome.storage.local.set({ [targetWords]: value });
    }
    return value;
  });

  const s = "😀";
  // const s = "";
  const className = "new-code";
  const arg: Arg = { s, targetWords: targetWordValue, className };

  const css = `
    .${className} {
      color: blue;
    }
  `;

  await chrome.scripting.insertCSS({ target: { tabId: target.id! }, css });

  switch (command) {
    case "conv":
      await save(target, temp1);
      await disableCodeTag(target, arg);
      // await convertWords(target, arg);
      break;
    case "re":
      await re(target, arg);
      await save(target, temp2);
      break;
    case "change":
      await change(target);
      break;
    default:
      throw Error("not supported command");
  }
});

async function save(target: chrome.tabs.Tab, key: string) {
  return execute(target, (key: string) => {
    const body = document.querySelector("body");
    if (body === null) throw Error("body is null");
    return chrome.storage.local.set({ [key]: body.outerHTML });
  }, key);
}

async function change(target: chrome.tabs.Tab) {
  return execute(target, async (appConfig: AppConfigs) => {
    const { temp1, temp2, stateKey } = appConfig.storageKey;
    const state = await chrome.storage.local.get([stateKey]);
    let cur = state[stateKey];
    if (cur === undefined) {
      cur = temp1;
    }
    const next = cur === temp1 ? temp2 : temp1;
    const data = await chrome.storage.local.get([next]);
    const body = document.querySelector("body");
    if (body === null) throw Error("body is null");
    body.outerHTML = data[next];

    await chrome.storage.local.set({ [stateKey]: next });
  }, appConfigs);
}
