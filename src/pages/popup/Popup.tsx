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

  const download = (data: string) => {
    const blob = new Blob([data], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "result.txt"
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url);
  }

  const onAdd = async (elem: string) => {
    const data = await chrome.storage.local.get([targetWords]);
    const result = [...data[targetWords], elem];
    await chrome.storage.local.set({ [targetWords]: result });
    setList(result);
    setInput("");
  }

  const onChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setInput(e.target.value);
  }

  return (
    <>
      {list.length > 0 && list.map((elem, idx) => (
        <div key={idx}>{elem}</div>
      ))}
      <input onChange={onChange} value={input} />
      <button onClick={() => onAdd(input)}>add</button>
    </>
  )
}
