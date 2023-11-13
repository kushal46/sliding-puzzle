// Represents a single box in the sliding puzzle grid
class Box {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    // Get the box above the current box, or return null if at the top edge
    getTopBox() {
      if (this.y === 0) return null;
      return new Box(this.x, this.y - 1);
    }
  
    // Get the box to the right of the current box, or return null if at the right edge
    getRightBox() {
      if (this.x === 2) return null;
      return new Box(this.x + 1, this.y);
    }
  
    // Get the box below the current box, or return null if at the bottom edge
    getBottomBox() {
      if (this.y === 2) return null;
      return new Box(this.x, this.y + 1);
    }
  
    // Get the box to the left of the current box, or return null if at the left edge
    getLeftBox() {
      if (this.x === 0) return null;
      return new Box(this.x - 1, this.y);
    }
  
    // Get an array of neighboring boxes that are not null
    getNextdoorBoxes() {
      return [
        this.getTopBox(),
        this.getRightBox(),
        this.getBottomBox(),
        this.getLeftBox()
      ].filter(box => box !== null);
    }
  
    // Get a random neighboring box
    getRandomNextdoorBox() {
      const nextdoorBoxes = this.getNextdoorBoxes();
      return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
    }
  }
  
  // Swap the positions of two boxes in the grid
  const swapBoxes = (grid, box1, box2) => {
    const temp = grid[box1.y][box1.x];
    grid[box1.y][box1.x] = grid[box2.y][box2.x];
    grid[box2.y][box2.x] = temp;
  };
  
  // Check if the puzzle is solved
  const isSolved = grid => {
    return (
      grid[0][0] === 1 &&
      grid[0][1] === 2 &&
      grid[0][2] === 3 &&
      grid[1][0] === 4 &&
      grid[1][1] === 5 &&
      grid[1][2] === 6 &&
      grid[2][0] === 7 &&
      grid[2][1] === 8 &&
      grid[2][2] === 0
    );
  };
  
  // Generate a random initial puzzle grid for a 3x3 puzzle
  const getRandomGrid = () => {
    let grid = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];
  
    // Shuffle the puzzle by making random moves
    let blankBox = new Box(2, 2);
    for (let i = 0; i < 1000; i++) {
      const randomNextdoorBox = blankBox.getRandomNextdoorBox();
      swapBoxes(grid, blankBox, randomNextdoorBox);
      blankBox = randomNextdoorBox;
    }
  
    // Ensure the shuffled puzzle is solvable; if not, regenerate
    if (isSolved(grid)) return getRandomGrid();
    return grid;
  };
  
  // Represents the state of the game
  class State {
    constructor(grid, move, time, status) {
      this.grid = grid;
      this.move = move;
      this.time = time;
      this.status = status;
    }
  
    // Initial state when the game is ready to start
    static ready() {
      return new State(
        [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        0,
        0,
        "ready"
      );
    }
  
    // Initial state when the game starts
    static start() {
      return new State(getRandomGrid(), 0, 0, "playing");
    }
  }
  
  // Represents the sliding puzzle game
  class Game {
    constructor(state) {
      this.state = state;
      this.tickId = null;
      this.tick = this.tick.bind(this);
      this.render();
      this.handleClickBox = this.handleClickBox.bind(this);
    }
  
    // Static method to create a game in the ready state
    static ready() {
      return new Game(State.ready());
    }
  
    // Update the game state on each tick
    tick() {
      this.setState({ time: this.state.time + 1 });
    }
  
    // Set a new state for the game and trigger a re-render
    setState(newState) {
      this.state = { ...this.state, ...newState };
      this.render();
    }
  
    // Handle clicks on puzzle boxes
    handleClickBox(box) {
      return function() {
        const nextdoorBoxes = box.getNextdoorBoxes();
        const blankBox = nextdoorBoxes.find(
          nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
        );
        if (blankBox) {
          const newGrid = [...this.state.grid];
          swapBoxes(newGrid, box, blankBox);
          if (isSolved(newGrid)) {
            clearInterval(this.tickId);
            this.setState({
              status: "won",
              grid: newGrid,
              move: this.state.move + 1
            });
          } else {
            this.setState({
              grid: newGrid,
              move: this.state.move + 1
            });
          }
        }
      }.bind(this);
    }
  
    // Render the game UI
    render() {
      const { grid, move, time, status } = this.state;
  
      // Render grid
      const newGrid = document.createElement("div");
      newGrid.className = "grid";
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const button = document.createElement("button");
  
          if (status === "playing") {
            // Add event listener for box clicks during the game
            button.addEventListener("click", this.handleClickBox(new Box(j, i)));
          }
  
          button.textContent = grid[i][j] === 0 ? "" : grid[i][j].toString();
          newGrid.appendChild(button);
        }
      }
      document.querySelector(".grid").replaceWith(newGrid);
  
      // Render button
      const newButton = document.createElement("button");
      if (status === "ready") newButton.textContent = "Play";
      if (status === "playing") newButton.textContent = "Reset";
      if (status === "won") newButton.textContent = "Play";
      // Add event listener for the main button
      newButton.addEventListener("click", () => {
        clearInterval(this.tickId);
        this.tickId = setInterval(this.tick, 1000);
        this.setState(State.start());
      });
      document.querySelector(".footer button").replaceWith(newButton);
  
      // Render move
      document.getElementById("move").textContent = `Move: ${move}`;
  
      // Render time
      document.getElementById("time").textContent = `Time: ${time}`;
  
      // Render message
      if (status === "won") {
        document.querySelector(".message").textContent = "You win!";
      } else {
        document.querySelector(".message").textContent = "";
      }
    }
  }
  
  // Initialize the game in the ready state
  const GAME = Game.ready();
  