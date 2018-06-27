const folder = "animals/";
const timer_upper_limit = 3*60 + 20;
const success_added_time = 4; // seconds

let current_lvl = 1;
let allowed_time = timer_upper_limit; // seconds
let timer = setInterval(update_timer, 1000);
let game_active = true;

let board = new Gameboard();
board.generate_game(DIM, current_lvl);
update_level();
render_game(board.game);


function update_timer() {
  allowed_time -= 1;
  update_progress_bar()
  if (allowed_time === 0) {
    document.getElementById("failure-message").style.display = "block";
    document.getElementById("main").style.opacity = 0.2;
    game_active = false;
    clearInterval(timer); return;
  }
}

function update_progress_bar() {
  if (game_active === false) {
    return;
  }
  let percentage = allowed_time / timer_upper_limit * 100
  document.getElementById("progress-bar").style.width = `${percentage}%`;
}

function next_level() {
  if (current_lvl === MAX_LEVEL) {
    return;
  }
  document.getElementById("success-message").style.display = "none";
  document.getElementById("failure-message").style.display = "none";
  current_lvl += 1;
  update_level();
  // reset
  clearInterval(timer);
  allowed_time = timer_upper_limit;
  timer = setInterval(update_timer, 1000);
  board = new Gameboard();
  board.generate_game(DIM, current_lvl);
  game_active = true;
  render_game(board.game);
}

function update_level() {
  document.getElementById("level-indicator").innerHTML = `Level ${current_lvl}/${MAX_LEVEL}: ${LEVEL_NAMES[current_lvl]}`;
}

function render_game(game) {
  let maindiv = document.getElementById("main");
  maindiv.opacity = 1;
  while (maindiv.firstChild) { // clear maindiv first before generating
    maindiv.removeChild(maindiv.firstChild);
  }
  for (i = 0; i < DIM[0] + 2; i++) {
    for (i2 = 0; i2 < DIM[1] + 2; i2++) {
      if (i === 0 | i2 === 0 | i === DIM[0] + 1| i2 === DIM[1] + 1) {
        continue;
      }
      var elem = document.createElement("img");
      if (game[i][i2] === -1) {
        elem.setAttribute("class", "tile");
        elem.setAttribute("id", `tile-${i}-${i2}`);
        elem.setAttribute("tile_row", i);
        elem.setAttribute("tile_col", i2);
        elem.classList.add("transparent")
        elem.src = folder + "transparent.svg";
      } else {
        elem.setAttribute("class", "tile");
        elem.setAttribute("id", `tile-${i}-${i2}`);
        elem.setAttribute("tile_row", i);
        elem.setAttribute("tile_col", i2);
        elem.setAttribute("onclick", "select_tile(this)")
        elem.src = folder + "item (" + (game[i][i2]+1) + ").svg";
      }
      maindiv.appendChild(elem);
    }
    // var linebreak = document.createElement("br")
    // maindiv.appendChild(br)
  }
}

function replace_with_transparent(elem) {
  elem.classList.add("transparent");
  elem.src = folder + "transparent.svg";
}

function render_partial(changed_tiles) {
  for (var ct = 0; ct < changed_tiles.length; ct++) {
    idx = changed_tiles[ct];
    if (board.game[idx[0]][idx[1]] === -1) {
      replace_with_transparent(document.getElementById(`tile-${idx[0]}-${idx[1]}`));
    } else {
      let elem = document.getElementById(`tile-${idx[0]}-${idx[1]}`);
      elem.classList.remove("transparent");
      elem.setAttribute("onclick", "select_tile(this)")
      elem.src = folder + "item (" + (board.game[idx[0]][idx[1]]+1) + ").svg";
    }
  }
}

function select_tile(elem) {
  let game = board.game
  if (game_active === false) {
    return;
  }
  let i = parseInt(elem.getAttribute("tile_row"));
  let i2 = parseInt(elem.getAttribute("tile_col"));
  if (game[i][i2] === -1) { return; }
  if (board.selected == -1) {
    elem.classList.add("selected");
    board.selected = [i, i2];
    return;
  }
  if (board.selected[0] == i && board.selected[1] == i2) { // they are the same tile
    elem.classList.remove("selected");
    board.selected = -1;
    return;
  }
  if (game[board.selected[0]][board.selected[1]] === game[i][i2]) {  // if same animal
    // see if there is shortest path
    let result = board.shortest_path(board.selected, [i, i2]);
    if (result == -1) { // no valid path, deselect both
      elem.classList.remove("selected");
      deselect_tile(board.selected[0], board.selected[1]);
      board.selected = -1;
      return;
    } else {
      board.destroy_animal(board.selected);
      board.destroy_animal([i, i2]);

      replace_with_transparent(document.getElementById(`tile-${board.selected[0]}-${board.selected[1]}`));
      replace_with_transparent(document.getElementById(`tile-${i}-${i2}`));

      deselect_tile(board.selected[0], board.selected[1]);
      board.selected = -1;

      let changed_tiles = board[LEVEL_FNS[current_lvl]]();
      render_partial(changed_tiles);

      if (allowed_time <= timer_upper_limit - success_added_time) {
        allowed_time += success_added_time;
      } else {
        allowed_time = timer_upper_limit;
      }
      update_progress_bar();
      if (board.is_empty() === true) {
        if (current_lvl === MAX_LEVEL) {
          document.getElementById("ultimate-success-message").style.display = "block";
        } else {
          document.getElementById("success-message").style.display = "block";
        }
        clearInterval(timer);
        game_active = false;
        return;
      }

      // check valid move
      board.vmove = board.find_valid_move()
      if (board.vmove === null) {
        console.log("no valid moves");
        reshuffle_game();
      }
    }
  } else {
    elem.classList.add("selected");
    deselect_tile(board.selected[0], board.selected[1]);
    board.selected = [i, i2];
  }
}

function deselect_tile(row, col) {
  if (game_active === false) {
    return;
  }
  document.getElementById(`tile-${row}-${col}`).classList.remove("selected");
}

function show_hint() {
  if (game_active === false) {
    return;
  }
  let start = board.vmove[0].pos
  let end = board.vmove[board.vmove.length - 1].pos

  let elements = [document.getElementById(`tile-${start[0]}-${start[1]}`), document.getElementById(`tile-${end[0]}-${end[1]}`)];
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.add("hint");
  }

  setTimeout(function () {
    for (var i = 0; i <  elements.length; i++) {
      elements[i].classList.remove("hint")
    }
  }, 1000)
}

function reshuffle_game() {
  if (game_active === false) {
    return;
  }
  board.reshuffle();
  board.vmove = board.find_valid_move();
  if (board.vmove === null) {
    reshuffle_game()
  }
  render_game(board.game);
}

function pause_game() {
  clearInterval(timer);
  game_active = false;
  document.getElementById("main").style.opacity = 0.2;
}

function unpause_game() {
  clearInterval(timer);
  timer = setInterval(update_timer, 1000);
  game_active = true;
  document.getElementById("main").style.opacity = 1;
}