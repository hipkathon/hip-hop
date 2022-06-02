const random = new Random();
const interpreter = new Interpreter(250);

const codeStyle = [];
let prevCodes = "";

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
      event.inputType === "insertLineBreak" ||
      event.inputType === "insertCompositionText"
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
    const originText = editor.value;
    if (editor.selectionStart != editor.selectionEnd)
    {
      editor.value = originText.slice(0, editor.selectionStart) + originText.slice(editor.selectionEnd);
      editor.selectionStart = cursorIndex;
    }

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

    prevCodes = originText;
    editor.selectionEnd = cursorIndex;

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

  const colors = ["red", "orange", "pink", "green", "blue", "purple", "black"];
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
