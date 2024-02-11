import {Arg, convertWords, disableCodeTag, re} from "@src/background/convert_article";
import {execute, findActiveTab} from "@src/background/background_utils";

chrome.commands.onCommand.addListener(async (command) => {
  const target = await findActiveTab();

const s = "😀";
  // const s = "";
  const color = "blue";
  const targetWords: string[] = [ "beans" ];
  const arg: Arg = { s, color, targetWords };

  if (command === "base") {
    const arg = { s: "", color, targetWords };
    await disableCodeTag(target, arg);
    await convertWords(target, arg);
  } else if (command === "conv") {
    await disableCodeTag(target, arg);
    await convertWords(target, arg);
  } else if (command === "re") {
    await re(target, arg);
  } else {
    throw Error("not supported command");
  }

  // await execute(target, (command: string) => {
  //   console.log(command);
  // }, command)
});
