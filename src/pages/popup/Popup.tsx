import React, {ChangeEventHandler, useEffect, useState} from 'react';
import {appConfigs} from "@src/config/app_configs";

export default function Popup(): JSX.Element {
  return (
    <div>
      <TestComp />
    </div>
  );
}

function TestComp() {

  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [inputInit, setInputInit] = useState("");

  const { targetWords } = appConfigs.storageKey;

  useEffect(() => {
    chrome.storage.local.get([targetWords]).then(async data => {
      let list = data[targetWords]
      if (list === undefined) {
        list = [];
        await chrome.storage.local.set({ [targetWords]: list });
      }
      setList(list);
    })
  }, []);

  const onAdd = async (elem: string) => {
    const data = await chrome.storage.local.get([targetWords]);
    const result = [...data[targetWords], elem];
    await chrome.storage.local.set({ [targetWords]: result });
    setList(result);
    setInput("");
  }

  const onDelete = async (elem: string) => {
    const data = await chrome.storage.local.get([targetWords]);
    const result = data[targetWords].filter((item: string) => item !== elem);
    await chrome.storage.local.set({ [targetWords]: result });
    setList(result);
  }

  const copyClipboard = async () => {
    const data = await chrome.storage.local.get([targetWords]);
    const json = JSON.stringify(data[targetWords]);
    await navigator.clipboard.writeText(json);
  }

  const clear = async () => {
    await chrome.storage.local.set({ [targetWords]: [] });
    setList([]);
  }

  const init = async () => {
    const list = JSON.parse(inputInit);
    if (!(list instanceof Array)) {
      throw Error("invalid json");
    }
    await chrome.storage.local.set({ [targetWords]: list });
    setList(list);
    setInputInit("");
  }

  return (
    <>
      <div>
        <input onChange={e => setInputInit(e.target.value)} value={inputInit}/>
        <button className="bg-amber-400 p-2" onClick={() => init()}>init</button>
      </div>
      <div>
        <button className="bg-amber-400 p-2" onClick={() => copyClipboard()}>copy</button>
      </div>
      <div>
        <button className="bg-amber-400 p-2" onClick={() => clear()}>clear</button>
      </div>
      <div>
        <input onChange={e => setInput(e.target.value)} value={input}/>
        <button className="bg-amber-400 p-2" onClick={() => onAdd(input)}>add</button>
      </div>
      {list.length > 0 && list.map((elem, idx) => (
        <div key={idx}>
          <span>{elem}</span>
          <button className="bg-pink-600 p-2" onClick={() => onDelete(elem)}>x</button>
        </div>
      ))}
    </>
  )
}
