import {execute} from "@src/background/background_utils";
import {AppConfigs, appConfigs} from "@src/config/app_configs";

export interface Arg {
  s: string;
  targetWords: string[];
  className: string;
}

export const disableCodeTag = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, async (arg: Arg, appConfigs: AppConfigs) => {
  function toArray<T extends ChildNode>(nodes: NodeListOf<T>): T[] {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      result.push(nodes[i]);
    }
    return result;
  }

  // disable <code> tag
  const body = document.querySelector("body");
  if (body === null) throw Error("element is null");

  const codes = toArray(document.querySelectorAll("code"));
  const filtered = codes.filter(elem => elem.childNodes.length === 1);

  const {s, className, targetWords } = arg;
  const regex = RegExp("<code.*?>(.*?)</code>", "ig")
  const before = `<span class="${className}">${s}$1${s}</span>`;

  for (const elem of filtered) {
    elem.outerHTML = elem.outerHTML.replace(regex, before);
  }

  // convert words
  let result = body.innerHTML;
  for (const word of targetWords) {
    result = result.replace(RegExp(`\\b(${word})\\b`, "ig"), `${s}$1${s}`);
  }

  // last processing
  const matched = result.match(RegExp(`${s}.*?${s}`, "gi"));
  if (matched === null) throw Error("match is null");
  console.log(matched)

  const { match } = appConfigs.storageKey;
  const convertedMap: any = {};
  for (let i = 0; i < matched.length; i++) {
    const converted = `{${i}}`;
    const matchedElem = matched[i]
    result = result.replace(matchedElem, converted);
    convertedMap[converted] = matchedElem.replace(RegExp(s, "gi"), "");
  }

  await chrome.storage.local.set({ [match]: convertedMap });

  body.innerHTML = result;
}, arg, appConfigs);

export const re = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, async (arg: Arg, appConfigs: AppConfigs) => {
  const { match } = appConfigs.storageKey;
  const matched = await chrome.storage.local.get([match]);
  const matchMap = matched[match];

  const target = document.querySelector("body");
  if (target === null) throw Error("element is null");

  let result = target.innerHTML;
  for (const elem of Object.keys(matchMap)) {
    result = result.replace(elem, matchMap[elem]);
  }

  target.innerHTML = result;
}, arg, appConfigs);
