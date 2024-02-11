import {execute} from "@src/background/background_utils";

export interface Arg {
  s: string;
  color: string;
  targetWords: string[];
}

export const disableCodeTag = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, (arg: Arg) => {
  function toArray<T extends ChildNode>(nodes: NodeListOf<T>): T[] {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      result.push(nodes[i]);
    }
    return result;
  }

  const {s, color} = arg;
  const codes = toArray(document.querySelectorAll("code"));
  const filtered = codes.filter(elem => elem.childNodes.length === 1);
  const regex = RegExp("(<code.*?>)(.*?)(</code>)", "ig")
  const before = `<span style="color:${color}">${s}$2${s}</span>`
  for (const elem of filtered) {
    const parent = elem.parentElement;
    if (parent === null) continue
    parent.innerHTML = parent.innerHTML.replace(regex, before);
  }
}, arg);

export const convertWords = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, (arg: Arg) => {
  const { s, targetWords } = arg;
  const target = document.querySelector("body");
  if (target === null) throw Error("element is null");
  for (const word of targetWords) {
    target.innerHTML = target
      .innerHTML
      .replace(RegExp(`\\b(${word})\\b`, "ig"), `${s}$1${s}`);
  }
}, arg);

export const re = (tab: chrome.tabs.Tab, arg: Arg) => execute(tab, (arg: Arg) => {
  const { s } = arg;
  const target = document.querySelector("article");
  if (target === null) throw Error("element is null");
  target.innerHTML = target
    .innerHTML
    .replace(RegExp(`${s}(.*?)${s}`, "ig"), "$1");
}, arg);
