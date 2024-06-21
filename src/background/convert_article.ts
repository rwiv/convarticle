import {execute} from "@src/background/background_utils";
import {AppConfigs, appConfigs} from "@src/config/app_configs";

export interface Arg {
  s: string;
  w: string;
  targetWords: string[];
  codeClassName: string;
  conceptClassName: string;
}

export const disableCodeTag = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, async (arg: Arg, appConfigs: AppConfigs) => {
  const {s, w, codeClassName, conceptClassName, targetWords } = arg;

  function convertCode(inner: string, className: string) {
    return `<span class="${className}">${s}${inner}${s}</span>`;
  }

  function convertTargetWord(inner: string, className: string) {
    return `<span class="${className}">${w}${inner}</span>`;
  }

  const body = document.querySelector("body");
  if (body === null) throw Error("element is null");

  let result = body.outerHTML;

  // disable <code> tag
  const matches = result.match(RegExp("<code.*?>(.*?)</code>", "ig"));
  if (matches === null) throw Error("regex match failure");
  for (const match of matches) {
    const regex = RegExp("<code.*?>(.*?)</code>", "i")
    const reMatch = regex.exec(match);
    if (reMatch === null || reMatch.length < 1) {
      continue;
    }

    result = result.replace(match, convertCode(reMatch[1], codeClassName));
  }

  // convert target words
  for (const word of targetWords) {
    result = result.replace(RegExp(`\\b(${word})\\b`, "ig"), convertTargetWord("$1", conceptClassName));
  }

  body.outerHTML = result;
}, arg, appConfigs);
