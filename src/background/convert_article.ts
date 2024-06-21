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

  const body = document.querySelector("body");
  if (body === null) throw Error("element is null");
  let outerHTML = body.outerHTML;

  // disable <code> tag
  outerHTML = outerHTML.replaceAll(
    /<code.*?>(.*?)<\/code>/ig,
      `<span class="${codeClassName}">${s}$1${s}</span>`
  )

  // convert target words
  for (const word of targetWords) {
    outerHTML = outerHTML.replaceAll(
      RegExp(`\\b(${word})\\b`, "ig"),
        `<span class="${conceptClassName}">${w}$1</span>`
    );
  }

  body.outerHTML = outerHTML;
}, arg, appConfigs);
