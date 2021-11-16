class Variables {
  constructor() {
    this.variables = {};
    this.stack = [];
  }

  set(color, value) {
    if (!color) {
      color = "black";
    }
    if (value === null || isNaN(value)) {
      return;
    }

    if (color === "black") {
      this.stack.push(value);

      const blackWapper = document.getElementById("black-wrapper");
      const span = document.createElement("span");
      span.innerText = value;
      blackWapper.append(span);
    } else {
      this.variables[color] = value;

      const variableSpan = document.getElementById(`${color}-value`);
      variableSpan.innerText = value;
    }
  }

  get(color) {
    if (!color) {
      color = "black";
    }

    if (color === "black") {
      const blackWapper = document.getElementById("black-wrapper");
      if (blackWapper.childNodes.length === 1) {
        return undefined;
      }
      const child = blackWapper.childNodes[blackWapper.childNodes.length - 1];
      blackWapper.removeChild(child);

      return this.stack.pop() || 0;
    } else {
      return this.variables[color] || 0;
    }
  }

  clear() {
    createColorButtons();

    this.variables = {};
    this.stack.length = 0;
  }
}
