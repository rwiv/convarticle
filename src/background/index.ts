import {Arg, disableCodeTag, re} from "@src/background/convert_article";
import {execute, findActiveTab} from "@src/background/background_utils";
import {AppConfigs, appConfigs} from "@src/config/app_configs";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "conv",
    id: "conv",
  });
  chrome.contextMenus.create({
    title: "re",
    id: "re",
  });
  chrome.contextMenus.create({
    title: "change",
    id: "change",
  });

  chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, target: chrome.tabs.Tab | undefined) => {
    if (target === undefined) return;

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
    const codeClassName = "new-code";
    const conceptClassName = "concept";
    const arg: Arg = { s, targetWords: targetWordValue, codeClassName, conceptClassName };

    // const css = `
    //   .${className} {
    //     background-color: #fff;
    //     border: 1px solid #e1e1e8;
    //     border-radius: 0;
    //     color: #009;
    //     font-size: .95em;
    //     font-weight: 400;
    //     padding: 0.125em 0.25em;
    //   }
    // `;

    // const css = `
    //   .${codeClassName} {
    //     color: #009;
    //   }
    //   .${conceptClassName} {
    //     color: blue;
    //   }
    // `;

    const css = `
    .${codeClassName} {
      color: #009;
    }
  `;

    await chrome.scripting.insertCSS({ target: { tabId: target.id! }, css });

    switch (info.menuItemId) {
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
  })
});

chrome.commands.onCommand.addListener(async (command) => {
  const target = await findActiveTab();

  const codeClassName = "new-code";
  const css = `
    .${codeClassName} {
      color: #009;
    }
  `;

  await chrome.scripting.insertCSS({ target: { tabId: target.id! }, css });

  switch (command) {
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
