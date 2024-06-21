import {execute} from "@src/background/background_utils";
import {AppConfigs, appConfigs} from "@src/config/app_configs";

export interface Arg {
  s: string;
  targetWords: string[];
  codeClassName: string;
  conceptClassName: string;
}

export const disableCodeTag = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, async (arg: Arg, appConfigs: AppConfigs) => {
  const {s, codeClassName, conceptClassName, targetWords } = arg;

  function getBefore(inner: string, className: string) {
    return `<span class="${className}">${s}${inner}${s}</span>`;
  }

  const body = document.querySelector("body");
  if (body === null) throw Error("element is null");

  // disable <code> tag
  const regex = RegExp("<code.*?>(.*?)</code>", "ig")

  let result = body.outerHTML;

  const m = result.match(regex);
  if (m === null) throw Error("regex match failure");
  for (const match of m) {
    const regex = RegExp("<code.*?>(.*?)</code>", "i")
    const reMatch = regex.exec(match);
    if (reMatch === null || reMatch.length < 1) {
      continue;
    }

    result = result.replace(match, getBefore(reMatch[1], codeClassName));
  }

  // convert words
  for (const word of targetWords) {
    result = result.replace(RegExp(`\\b(${word})\\b`, "ig"), getBefore("$1", conceptClassName));
  }

  // last processing
  const matched = result.match(RegExp(`${s}.*?${s}`, "gi"));
  if (matched === null) throw Error("match is null");

  const { match } = appConfigs.storageKey;
  const convertedMap: any = {};
  for (let i = 0; i < matched.length; i++) {
    const converted = `{${i}}`;
    const matchedElem = matched[i]
    result = result.replace(matchedElem, converted);
    convertedMap[converted] = matchedElem.replace(RegExp(s, "gi"), "");
  }

  await chrome.storage.local.set({ [match]: convertedMap });

  body.outerHTML = result;
}, arg, appConfigs);

export const re = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, async (arg: Arg, appConfigs: AppConfigs) => {
  const { match } = appConfigs.storageKey;
  const matched = await chrome.storage.local.get([match]);
  const matchMap = matched[match];

  const target = document.querySelector("body");
  if (target === null) throw Error("element is null");

  let result = target.outerHTML;
  for (const elem of Object.keys(matchMap)) {
    result = result.replace(elem, matchMap[elem]);
  }

  target.outerHTML = result;
}, arg, appConfigs);
