let rand = null;
let beats = [];
const codes = [['C', 'G', 'Am', 'F'], ['F', 'C', 'Dm', 'G']];
const hz = {
    C:  [130.813, 164.834, 195.998, 261.626, 329.628, 391.995, 523.251, 659.255],
    Dm: [146.832, 184.997, 220.000, 293.665, 369.994, 440.000, 587.330, 739.989],
    G:  [146.832, 195.998, 246.942, 293.665, 391.995, 493.883, 587.330, 783.991],
    Em: [155.564, 184.997, 195.998, 246.942, 311.127, 369.994, 391.995, 493.883],
    Am: [130.813, 164.834, 220.000, 261.626, 329.628, 440.000, 523.251, 659.255],
    F:  [130.813, 174.614, 220.000, 261.626, 349.228, 440.000, 523.251, 698.457]
};
let codeType = 0, codeIndex = -1;
let isRunning = false;

const xmur3 = (str) => {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    }
    return () => {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
};
const mulberry32 = (a) => {
    return () => {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
};
const setSeed = (str) => {
    const seed = xmur3(str);
    rand = mulberry32(seed());
    codeType = Math.floor(rand() * 2);
}


let audioContext = null;

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new window.AudioContext() || new window.webkitAudioContext();
    }
    return audioContext;
}

const codeStyle = [];
let prevCodes = '';

const colors = ['red', 'orange', 'pink', 'green', 'blue', 'purple', 'black'];
let variables = {};
const labels = {};
const keywordObject = {
    hip: 'SDI',
    ping: 'SDI',
    song: 'SDO',
    hop: 'SDO',
    pop: 'SDOI',
    pong: 'SDOI',
    chill: 'ADD',
    funkey: 'ADD',
    baller: 'ADD',
    ill: 'SUB',
    ice: 'SUB',
    sup: 'SUB',
    feel: 'MUL',
    trouble: 'MUL',
    like: 'MUL',
    flex: 'DIV',
    haters: 'DIV',
    gay: 'MOD',
    say: 'JEQ',
    respect: 'JEQ',
    hit: 'JLT',
    disrespect: 'JLT',
    call: 'JMP'
};

const stack = [];

const setVariableValue = (color, value) => {
    if (!color){
        color = 'black'
    }
    if (value === null || isNaN(value)) {
        return;
    }

    if(color === 'black'){
        stack.push(value);
        const blackWapper = document.getElementById('black-wrapper');

        const span = document.createElement('span');
        span.innerText = value;

        blackWapper.append(span);

    } else {
        variables[color] = value;
        const variableSpan = document.getElementById(`${color}-value`);
        variableSpan.innerText = value;
    }
}

const getVariableValue = (color) => {
    if (!color){
        color = 'black'
    }

    if (color === 'black'){
        const blackWapper = document.getElementById('black-wrapper');
        if(blackWapper.childNodes.length === 1){
            return undefined;
        }
        const child = blackWapper.childNodes[blackWapper.childNodes.length - 1];
        blackWapper.removeChild(child);
        
        return stack.pop() || 0;
    } else {
        return variables[color] || 0;
    }
}

const playBeat = () => {
    getAudioContext();
    const hz = 65.406;
    //const beats = [0, 0.5, 1, 1.5];
    //const beats = [0, 0.375, 0.5, 1, 1.5];
    
    const oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 0;
    oscillator.start(0);
    const currentTime = audioContext.currentTime;
    beats.forEach(beat => {
        oscillator.frequency.setTargetAtTime(hz, currentTime + beat + 0, 0.001);
        oscillator.frequency.setTargetAtTime(0, currentTime + beat + 0.03, 0.001);
    });
    setTimeout(() => {
        oscillator.stop(0);
    }, 2000);
};

const playMelody = () => {
    getAudioContext();
    const oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = hz[codes[codeType][codeIndex]][Math.floor(rand() * 8)];
    oscillator.start();
    setTimeout(() => {
        oscillator.stop(0);
    }, 100);
};

const getCommandListPerLine = (codeContent) => {
    const commandListPerLine = [];
    let commandList = [];

    let command = '';
    for(let index = 0; index < codeContent.length; index++){
        if (codeContent[index] === ' ' || codeContent[index] === '\n'){
            commandList.push({
                command: command,
                position: index - command.length
            });
            command = '';
            if (codeContent[index] === '\n') {
                commandListPerLine.push(
                    JSON.parse(JSON.stringify(commandList))
                );
                commandList = [];
            }
        } else {
            command += codeContent[index];
        }
    }
    commandList.push({
        command: command,
        position: codeContent.length - command.length
    });
    commandListPerLine.push(commandList);

    return commandListPerLine;
}

let lastTimestamp = new Date(), interval = 250, count = 8;

const run = async () => {
    isRunning = true;
    variables = {};

    let consoleTextArea = document.getElementById('console-text-area');
    consoleTextArea.value = '';

    const displayText = document.getElementById('editor');
    const codeContent = displayText.value;

    setSeed(codeContent.length.toString());
    beats = [0.03, 0.53, 1.03, 1.53];
    /*for (let i = 0.03; i < 2; i += 0.125) {
        if (rand() < 0.5) {
            beats.push(i);
        }
    }*/

    const commandListPerLine = getCommandListPerLine(codeContent);

    const indicatorWrapper = document.getElementById('indicator-wrapper');
    const indicator = document.createElement('span');
    indicator.style = 'position: absolute';
    indicator.innerText = '>';
    indicatorWrapper.appendChild(indicator);

    let lineIndex = 0;
    while (lineIndex < commandListPerLine.length && isRunning) {
        let commandLine = commandListPerLine[lineIndex];
        
        if (count == 8) {
            playBeat();
            codeIndex = (codeIndex + 1) % 4;
            count = 0;
        }
        count++;

        indicator.style = `position: absolute; top: ${3 + lineIndex * 21}px; left: -15px`;
        for (let commandIndex = 0; commandIndex < commandLine.length; commandIndex++){
            const commandObject = commandLine[commandIndex];
            if (!commandObject.command){
                // Empty string
                continue;
            }

            const firstColor = codeStyle[commandObject.position];
            const secondColor = codeStyle[commandObject.position + 1];

            switch(keywordObject[commandObject.command]){
                case 'MOV':
                    setVariableValue(firstColor, getVariableValue(secondColor));
                    break;
                case 'ADD':
                    setVariableValue(firstColor, getVariableValue(firstColor) + getVariableValue(secondColor));
                    playMelody();
                    break;
                case 'SUB':
                    setVariableValue(firstColor, getVariableValue(firstColor) - getVariableValue(secondColor));
                    playMelody();
                    break;
                case 'MUL':
                    setVariableValue(firstColor, getVariableValue(firstColor) * getVariableValue(secondColor));
                    playMelody();
                    break;
                case 'DIV':
                    const secondValue = getVariableValue(secondColor);
                    if(secondValue === 0){
                        setVariableValue(secondColor, secondValue)
                    }else{
                        setVariableValue(firstColor, getVariableValue(firstColor) / secondValue);
                        playMelody();
                    }
                    break;
                case 'MOD':
                    setVariableValue(firstColor, getVariableValue(firstColor) % getVariableValue(secondColor));
                    playMelody();
                    break;
                case 'JEQ':
                    if (variables[firstColor] === 0) {
                        if (commandLine[commandIndex + 1]){
                            if (labels.hasOwnProperty(commandLine[commandIndex + 1].command)) {
                                lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
                            } else {
                                commandIndex++;
                            }
                        }
                    }
                    break;
                case 'JLT':
                    if (variables[firstColor] < 0) {
                        if (commandLine[commandIndex + 1]){
                            if (labels.hasOwnProperty(commandLine[commandIndex + 1].command)) {
                                lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
                            } else {
                                commandIndex++;
                            }
                        }
                    }
                    break;
                case 'JMP':
                    if (commandLine[commandIndex + 1]){
                        if (labels.hasOwnProperty(commandLine[commandIndex + 1].command)) {
                            lineIndex = labels[commandLine[commandIndex + 1].command] - 1;
                        } else {
                            commandIndex++;
                        }
                    }
                    break;
                case 'SDO': 
                    const value = getVariableValue(firstColor);
                    consoleTextArea = document.getElementById('console-text-area');
                    consoleTextArea.value += String.fromCharCode(parseInt(value,10));
                    break;
                case 'SDOI': 
                    consoleTextArea = document.getElementById('console-text-area');
                    consoleTextArea.value += getVariableValue(firstColor);
                    break;
                default:
                    if (/^swa+g$/.test(commandObject.command)) {
                        setVariableValue(firstColor, commandObject.command.length - 3);
                    } else {
                        labels[commandObject.command] = lineIndex;
                    }
                    break;
            }
        }
        lineIndex++;

        let currentTime = new Date()
        let timeGap = currentTime - lastTimestamp
        lastTimestamp = currentTime;
        timeGap = timeGap > 270 || timeGap < 230 ? 250 : timeGap;
        await new Promise(resolve => setTimeout(resolve, interval + (interval - timeGap) * 0.8));
    }

    indicatorWrapper.removeChild(indicator);
    isRunning = false;
};

const cancel = () => {
    isRunning = false;
};

const renderDisplayText = () => {
    const displayText = document.getElementById('display-text');
    displayText.innerHTML = '';

    const len = editor.value.length;
    let buffer = '';
    for (let i = 0; i < len; i++) {
        if (codeStyle[i]) {
            buffer += `<span style="color:${codeStyle[i]}">${editor.value[i]}</span>`
        } else {
            buffer += editor.value[i];
        }
    }
    displayText.innerHTML = buffer;
    displayText.innerHTML = displayText.innerHTML.replace(/\n/g, '<br/>');
};

const bindEditorEvents = () => {
    const editor = document.getElementById('editor');
    editor.addEventListener('input', (event) => {
        if (event.inputType === 'deleteContentBackward') {
            codeStyle.splice(editor.selectionStart, prevCodes.length - editor.value.length);
        } else if (event.inputType === 'deleteContentForward') {
            codeStyle.splice(editor.selectionStart , prevCodes.length - editor.value.length);
        } else if (event.inputType === 'insertText' || event.inputType === 'insertLineBreak') {
            if (prevCodes.length >= editor.value.length) {
                codeStyle.splice(editor.selectionStart , prevCodes.length - editor.value.length + 1);
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
    editor.addEventListener('cut', (event) => {
        let copiedData = '';
        const editor = document.getElementById('editor');
        for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
            if (codeStyle[i]) {
                copiedData += `{${codeStyle[i]}}`;
            }
            copiedData += editor.value[i];
        }
        event.clipboardData.setData('text/plain', copiedData);
        event.preventDefault();

        codeStyle.splice(editor.selectionStart, editor.selectionEnd - editor.selectionStart);
        editor.value = [editor.value.slice(0, editor.selectionStart), editor.value.slice(editor.selectionEnd)].join('');

        renderDisplayText();

        prevCodes = editor.value;
    });
    editor.addEventListener('copy', (event) => {
        let copiedData = '';
        const editor = document.getElementById('editor');
        for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
            if (codeStyle[i]) {
                copiedData += `{${codeStyle[i]}}`;
            }
            copiedData += editor.value[i];
        }
        event.clipboardData.setData('text/plain', copiedData);
        event.preventDefault();
    });
    editor.addEventListener('paste', (event) => {
        const copiedData = event.clipboardData.getData('text/plain');
        const editor = document.getElementById('editor');
        let cursorIndex = editor.selectionStart;
        for (let i = 0; i < copiedData.length; i++) {
            if (copiedData[i] === '{') {
                const endBrace = copiedData.indexOf('}', i) + 1;
                codeStyle.splice(cursorIndex, 0, copiedData.slice(i + 1, endBrace - 1));
                i = endBrace;
                editor.value = [editor.value.slice(0, cursorIndex), copiedData[i], editor.value.slice(cursorIndex)].join('');
                cursorIndex++;
            } else {
                codeStyle.splice(cursorIndex, 0, null);
                editor.value = [editor.value.slice(0, cursorIndex), copiedData[i], editor.value.slice(cursorIndex)].join('');
                cursorIndex++;
            }
        }

        renderDisplayText();

        prevCodes = editor.value;

        event.preventDefault();
    });
};

const onClickColorButton = (event) => {
    const editor = document.getElementById('editor');
    for (let i = editor.selectionStart; i < editor.selectionEnd; i++) {
        codeStyle[i] = event.target.value;
    }

    renderDisplayText();
}

const createColorButtons = () => {
    const colorButtonWrapper = document.getElementById('color-buttons-wrapper');
    
    colors.forEach(color => {
        const colorWrapper = document.createElement('div');
        colorWrapper.className = 'd-flex align-items-center';
        colorWrapper.setAttribute('id', `${color}-wrapper`)

        const colorButton = document.createElement('button');
        colorButton.className = 'color-button';
        colorButton.style = `background-color: ${color}`;
        colorButton.value = color;
        colorButton.addEventListener('click', onClickColorButton);
        colorWrapper.append(colorButton);

        if (color !== 'black') {
            const colorValue = document.createElement('span');
            colorValue.setAttribute('id', `${color}-value`);
            colorValue.innerText = 0;
            colorWrapper.append(colorValue);
        }

        colorButtonWrapper.append(colorWrapper);
    });
};

const resize = obj => {
    const originalHeight = obj.style.height;
    obj.style.height = "1px";
    if (obj.scrollHeight > 400) {
        obj.style.height = `${12 + obj.scrollHeight}px`;
    } else {
        obj.style.height = originalHeight;
    }
}

const init = () => {
    createColorButtons();
    bindEditorEvents();
}

window.onload = init;