import {Arg, disableCodeTag} from "@src/background/convert_article";
import {appConfigs} from "@src/config/app_configs";
import pluralize from "pluralize";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "convert",
    id: "convert",
  });
});

chrome.contextMenus.onClicked.addListener(async (info: chrome.contextMenus.OnClickData, target: chrome.tabs.Tab | undefined) => {
  if (target === undefined) return;

  const { targetWords } = appConfigs.storageKey;
  const targetWordValue: string[] = await chrome.storage.local.get([targetWords]).then(async data => {
    let value = data[targetWords];
    if (value === undefined) {
      value = [];
      await chrome.storage.local.set({ [targetWords]: value });
    }
    return value;
  });
  const newTargetWordValue = targetWordValue.flatMap(word => [ word, pluralize(word) ]);

  // const s = "😀";
  const s = "`";
  const w = "_";
  const codeClassName = "new-code";
  const conceptClassName = "concept";
  const arg: Arg = { s, w, targetWords: newTargetWordValue, codeClassName, conceptClassName };

  const css = `
    .${codeClassName} {
      font-weight: 500;
    }
  `;

  await chrome.scripting.insertCSS({ target: { tabId: target.id! }, css });

  switch (info.menuItemId) {
    case "convert":
      await disableCodeTag(target, arg);
      break;
    default:
      throw Error("not supported command");
  }
});
