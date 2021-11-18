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

class Interpreter {
  constructor(interval) {
    this.isRunning = false;
    this.lastTimestamp = new Date();
    this.interval = interval;
    this.play = new PlaySound();

    this.labels = {};
    this.variables = new Variables();
  }

  async run() {
    this.isRunning = true;
    let count = 8;
    this.variables.clear();
    this.labels = {};

    const runButton = document.getElementById("run-button");
    const stopButton = document.getElementById("stop-button");
    runButton.disabled = true;
    stopButton.disabled = false;

    let consoleTextArea = document.getElementById("console-text-area");
    consoleTextArea.value = "";

    const displayText = document.getElementById("editor");
    const codeContent = displayText.value;

    random.setSeed(codeContent.length.toString());
    this.play.setCodeType();

    const commandListPerLine = getCommandListPerLine(codeContent);

    const indicatorWrapper = document.getElementById("indicator-wrapper");
    const indicator = document.createElement("span");
    indicator.style = "position: absolute";
    indicator.innerText = ">";
    indicatorWrapper.appendChild(indicator);

    let lineIndex = 0;
    while (lineIndex < commandListPerLine.length && this.isRunning) {
      let commandLine = commandListPerLine[lineIndex];

      if (count == 8) {
        this.play.beat();
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
            this.variables.set(firstColor, this.variables.get(secondColor));
            break;
          case "ADD":
            this.variables.set(
              firstColor,
              this.variables.get(firstColor) + this.variables.get(secondColor)
            );
            this.play.melody();
            break;
          case "SUB":
            this.variables.set(
              firstColor,
              this.variables.get(firstColor) - this.variables.get(secondColor)
            );
            this.play.melody();
            break;
          case "MUL":
            this.variables.set(
              firstColor,
              this.variables.get(firstColor) * this.variables.get(secondColor)
            );
            this.play.melody();
            break;
          case "DIV":
            const secondValue = this.variables.get(secondColor);
            if (secondValue === 0) {
              this.variables.set(secondColor, secondValue);
            } else {
              this.variables.set(
                firstColor,
                this.variables.get(firstColor) / secondValue
              );
              this.play.melody();
            }
            break;
          case "MOD":
            this.variables.set(
              firstColor,
              this.variables.get(firstColor) % this.variables.get(secondColor)
            );
            this.play.melody();
            break;
          case "JEQ":
            if (this.variables[firstColor] === 0) {
              if (commandLine[commandIndex + 1]) {
                if (
                  this.labels.hasOwnProperty(
                    commandLine[commandIndex + 1].command
                  )
                ) {
                  lineIndex =
                    this.labels[commandLine[commandIndex + 1].command] - 1;
                } else {
                  commandIndex++;
                }
              }
            }
            break;
          case "JLT":
            if (this.variables[firstColor] < 0) {
              if (commandLine[commandIndex + 1]) {
                if (
                  this.labels.hasOwnProperty(
                    commandLine[commandIndex + 1].command
                  )
                ) {
                  lineIndex =
                    this.labels[commandLine[commandIndex + 1].command] - 1;
                } else {
                  commandIndex++;
                }
              }
            }
            break;
          case "JMP":
            if (commandLine[commandIndex + 1]) {
              if (
                this.labels.hasOwnProperty(
                  commandLine[commandIndex + 1].command
                )
              ) {
                lineIndex =
                  this.labels[commandLine[commandIndex + 1].command] - 1;
              } else {
                commandIndex++;
              }
            }
            break;
          case "SDO":
            const value = this.variables.get(firstColor);
            consoleTextArea = document.getElementById("console-text-area");
            consoleTextArea.value += String.fromCharCode(parseInt(value, 10));
            break;
          case "SDOI":
            consoleTextArea = document.getElementById("console-text-area");
            consoleTextArea.value += this.variables.get(firstColor);
            break;
          default:
            if (/^swa+g$/.test(commandObject.command)) {
              this.variables.set(firstColor, commandObject.command.length - 3);
            } else {
              this.labels[commandObject.command] = lineIndex;
            }
            break;
        }
      }
      lineIndex++;

      let currentTime = new Date();
      let timeGap = currentTime - this.lastTimestamp;
      this.lastTimestamp = currentTime;
      timeGap = timeGap > 270 || timeGap < 230 ? 250 : timeGap;
      await new Promise((resolve) =>
        setTimeout(resolve, this.interval + (this.interval - timeGap) * 0.8)
      );
    }

    indicatorWrapper.removeChild(indicator);
    isRunning = false;
  }

  stop() {
    this.isRunning = false;

    const runButton = document.getElementById("run-button");
    const stopButton = document.getElementById("stop-button");
    runButton.disabled = false;
    stopButton.disabled = true;
  }
}
