const random = new Random();
const play = new PlaySound();
const variables = new Variables();

let isRunning = false;
const codeStyle = [];
let prevCodes = "";

const colors = ["red", "orange", "pink", "green", "blue", "purple", "black"];
const labels = {};
const keywordObject = {
  hip: "SDI",
  ping: "SDI",
  song: "SDO",
  hop: "SDO",
  pop: "SDOI",
  pong: "SDOI",
  chill: "ADD",
  funkey: "ADD",
  baller: "ADD",
  ill: "SUB",
  ice: "SUB",
  sup: "SUB",
  feel: "MUL",
  trouble: "MUL",
  like: "MUL",
  flex: "DIV",
  haters: "DIV",
  gay: "MOD",
  say: "JEQ",
  respect: "JEQ",
  hit: "JLT",
  disrespect: "JLT",
  call: "JMP",
};

const getCommandListPerLine = (codeContent) => {
  const commandListPerLine = [];
  let commandList = [];

  let command = "";
  for (let index = 0; index < codeContent.length; index++) {
    if (codeContent[index] === " " || codeContent[index] === "\n") {
      commandList.push({
        command: command,
        position: index - command.length,
      });
      command = "";
      if (codeContent[index] === "\n") {
        commandListPerLine.push(JSON.parse(JSON.stringify(commandList)));
        commandList = [];
      }
    } else {
      command += codeContent[index];
    }
  }
  commandList.push({
    command: command,
    position: codeContent.length - command.length,
  });
  commandListPerLine.push(commandList);

  return commandListPerLine;
};

let lastTimestamp = new Date();
let interval = 250;
let count = 8;

const run = async () => {
  isRunning = true;
  count = 8;
  variables.clear();

  let consoleTextArea = document.getElementById("console-text-area");
  consoleTextArea.value = "";

  const displayText = document.getElementById("editor");
  const codeContent = displayText.value;

  random.setSeed(codeContent.length.toString());
  play.setCodeType();

  const commandListPerLine = getCommandListPerLine(codeContent);

  const indicatorWrapper = document.getElementById("indicator-wrapper");
  const indicator = document.createElement("span");
  indicator.style = "position: absolute";
  indicator.innerText = ">";
  indicatorWrapper.appendChild(indicator);

  let lineIndex = 0;
  while (lineIndex < commandListPerLine.length && isRunning) {
    let commandLine = commandListPerLine[lineIndex];

    if (count == 8) {
      play.beat();
      count = 0;
    }
    count++;

    indicator.style = `position: absolute; top: ${
      3 + lineIndex * 21
    }px; left: -15px`;
    for (
      let commandIndex = 0;
      commandIndex < commandLine.length;
      commandIndex++
    ) {
      const commandObject = commandLine[commandIndex];
      if (!commandObject.command) {
        // Empty string
        continue;
      }

      const firstColor = codeStyle[commandObject.position];
      const secondColor = codeStyle[commandObject.position + 1];

      switch (keywordObject[commandObject.command]) {
        case "MOV":
          variables.set(firstColor, variables.get(secondColor));
          break;
        case "ADD":
          variables.set(
            firstColor,
            variables.get(firstColor) + variables.get(secondColor)
          );
          play.melody();
          break;
        case "SUB":
          variables.set(
            firstColor,
            variables.get(firstColor) - variables.get(secondColor)
          );
          play.melody();
          break;
        case "MUL":
          variables.set(
            firstColor,
            variables.get(firstColor) * variables.get(secondColor)
          );
          play.melody();
          break;
        case "DIV":
          const secondValue = variables.get(secondColor);
          if (secondValue === 0) {
            variables.set(secondColor, secondValue);
          } else {
            variables.set(firstColor, variables.get(firstColor) / secondValue);
            play.melody();
          }
          break;
        case "MOD":
          variables.set(
            firstColor,
            variables.get(firstColor) % variables.get(secondColor)
          );
          play.melody();
          break;
        case "JEQ":
          if (variables[firstColor] === 0) {
            if (commandLine[commandIndex + 1]) {
              if (
                labels.hasOwnProperty(commandLine[commandIndex + 1].command)
              ) {
                lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
              } else {
                commandIndex++;
              }
            }
          }
          break;
        case "JLT":
          if (variables[firstColor] < 0) {
            if (commandLine[commandIndex + 1]) {
              if (
                labels.hasOwnProperty(commandLine[commandIndex + 1].command)
              ) {
                lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
              } else {
                commandIndex++;
              }
            }
          }
          break;
        case "JMP":
          if (commandLine[commandIndex + 1]) {
            if (labels.hasOwnProperty(commandLine[commandIndex + 1].command)) {
              lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
            } else {
              commandIndex++;
            }
          }
          break;
        case "SDO":
          const value = variables.get(firstColor);
          consoleTextArea = document.getElementById("console-text-area");
          consoleTextArea.value += String.fromCharCode(parseInt(value, 10));
          break;
        case "SDOI":
          consoleTextArea = document.getElementById("console-text-area");
          consoleTextArea.value += variables.get(firstColor);
          break;
        default:
          if (/^swa+g$/.test(commandObject.command)) {
            variables.set(firstColor, commandObject.command.length - 3);
          } else {
            labels[commandObject.command] = lineIndex;
          }
          break;
      }
    }
    lineIndex++;

    let currentTime = new Date();
    let timeGap = currentTime - lastTimestamp;
    lastTimestamp = currentTime;
    timeGap = timeGap > 270 || timeGap < 230 ? 250 : timeGap;
    await new Promise((resolve) =>
      setTimeout(resolve, interval + (interval - timeGap) * 0.8)
    );
  }

  indicatorWrapper.removeChild(indicator);
  isRunning = false;
};

const cancel = () => {
  isRunning = false;
};

const renderDisplayText = () => {
  const displayText = document.getElementById("display-text");
  displayText.innerHTML = "";

  const len = editor.value.length;
  let buffer = "";
  for (let i = 0; i < len; i++) {
    if (codeStyle[i]) {
      buffer += `<span style="color:${codeStyle[i]}">${editor.value[i]}</span>`;
    } else {
      buffer += editor.value[i];
    }
  }
  displayText.innerHTML = buffer;
  displayText.innerHTML = displayText.innerHTML.replace(/\n/g, "<br/>");
};

const bindEditorEvents = () => {
  const editor = document.getElementById("editor");
  editor.addEventListener("input", (event) => {
    if (event.inputType === "deleteContentBackward") {
      codeStyle.splice(
        editor.selectionStart,
        prevCodes.length - editor.value.length
      );
    } else if (event.inputType === "deleteContentForward") {
      codeStyle.splice(
        editor.selectionStart,
        prevCodes.length - editor.value.length
      );
    } else if (
      event.inputType === "insertText" ||
      event.inputType === "insertLineBreak"
    ) {
      if (prevCodes.length >= editor.value.length) {
        codeStyle.splice(
          editor.selectionStart,
          prevCodes.length - editor.value.length + 1
        );
      }
      codeStyle.splice(editor.selectionStart - 1, 0, null);
    } else {
      editor.value = prevCodes;
      event.stopPropagation();
      return;
    }

    renderDisplayText();

    prevCodes = editor.value;
  });
  editor.addEventListener("cut", (event) => {
    let copiedData = "";
    const editor = document.getElementById("editor");
    for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
      if (codeStyle[i]) {
        copiedData += `{${codeStyle[i]}}`;
      }
      copiedData += editor.value[i];
    }
    event.clipboardData.setData("text/plain", copiedData);
    event.preventDefault();

    codeStyle.splice(
      editor.selectionStart,
      editor.selectionEnd - editor.selectionStart
    );
    editor.value = [
      editor.value.slice(0, editor.selectionStart),
      editor.value.slice(editor.selectionEnd),
    ].join("");

    renderDisplayText();

    prevCodes = editor.value;
  });
  editor.addEventListener("copy", (event) => {
    let copiedData = "";
    const editor = document.getElementById("editor");
    for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
      if (codeStyle[i]) {
        copiedData += `{${codeStyle[i]}}`;
      }
      copiedData += editor.value[i];
    }
    event.clipboardData.setData("text/plain", copiedData);
    event.preventDefault();
  });
  editor.addEventListener("paste", (event) => {
    const copiedData = event.clipboardData.getData("text/plain");
    const editor = document.getElementById("editor");
    let cursorIndex = editor.selectionStart;
    for (let i = 0; i < copiedData.length; i++) {
      if (copiedData[i] === "{") {
        const endBrace = copiedData.indexOf("}", i) + 1;
        codeStyle.splice(cursorIndex, 0, copiedData.slice(i + 1, endBrace - 1));
        i = endBrace;
        editor.value = [
          editor.value.slice(0, cursorIndex),
          copiedData[i],
          editor.value.slice(cursorIndex),
        ].join("");
        cursorIndex++;
      } else {
        codeStyle.splice(cursorIndex, 0, null);
        editor.value = [
          editor.value.slice(0, cursorIndex),
          copiedData[i],
          editor.value.slice(cursorIndex),
        ].join("");
        cursorIndex++;
      }
    }

    renderDisplayText();

    prevCodes = editor.value;

    event.preventDefault();
  });
};

const onClickColorButton = (event) => {
  const editor = document.getElementById("editor");
  for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
    codeStyle[i] = event.target.value;
  }

  renderDisplayText();
};

const createColorButtons = () => {
  const colorButtonWrapper = document.getElementById("color-buttons-wrapper");
  colorButtonWrapper.innerText = "";

  colors.forEach((color) => {
    const colorWrapper = document.createElement("div");
    colorWrapper.className = "d-flex align-items-center";
    colorWrapper.setAttribute("id", `${color}-wrapper`);

    const colorButton = document.createElement("button");
    colorButton.className = "color-button";
    colorButton.style = `background-color: ${color}`;
    colorButton.value = color;
    colorButton.addEventListener("click", onClickColorButton);
    colorWrapper.append(colorButton);

    if (color !== "black") {
      const colorValue = document.createElement("span");
      colorValue.setAttribute("id", `${color}-value`);
      colorValue.innerText = 0;
      colorWrapper.append(colorValue);
    }

    colorButtonWrapper.append(colorWrapper);
  });
};

const resize = (obj) => {
  const originalHeight = obj.style.height;
  obj.style.height = "1px";
  if (obj.scrollHeight > 400) {
    obj.style.height = `${12 + obj.scrollHeight}px`;
  } else {
    obj.style.height = originalHeight;
  }
};

const init = () => {
  createColorButtons();
  bindEditorEvents();
};

window.onload = init;
