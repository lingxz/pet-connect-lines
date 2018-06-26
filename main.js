const DIM = [10, 14];
const MAX_TURNS = 2;
var selected = -1;

const MAX_LEVEL = 7;
const LEVEL_FNS = {
    2: left_right_split,
    3: up_down_split,
    4: flush_left,
    5: flush_right,
    6: flush_down,
    7: flush_up,
}

const LEVEL_NAMES = {
    1: "Beginner",
    2: "Left right split",
    3: "Up down split",
    4: "Flush left",
    5: "Flush right",
    6: "Flush up",
    7: "Flush down",
}

function new_row(length, fill) {
    let row = [];
    for (var i = 0; i < length; i++) {
        row.push(fill)
    }
    return row
}

function generate_game(dim) {
    const num_tiles = dim[0] * dim[1];
    const num_repeats = 6;
    // const num_animals = num_tiles / num_repeats;
    const num_animals = 24
    var bucket = [];
    for (var i = 0; i < num_animals; i++) {
        if (i === num_animals - 1) {
            for (var i2 = 0; i2 < 2; i2++) {
                bucket.push(i);
            }
        } else {
            for (var i2 = 0; i2 < num_repeats; i2++) {
                bucket.push(i);
            }
        }
    }
    const game = [];
    game.push(new_row(dim[1] + 2, -1))
    // need to add empty outer layer
    for (var row = 0; row < dim[0]; row++) {
        whole_row = [-1];
        for (var col = 0; col < dim[1]; col++) {
            let random_index = Math.floor(Math.random() * bucket.length);
            whole_row.push(bucket.splice(random_index, 1)[0]);
        }
        whole_row.push(-1);
        game.push(whole_row);
    }
    game.push(new_row(dim[1] + 2, -1));
    console.log(game)
    let vmove = find_valid_move(game);
    if (vmove === null) {
        return generate_game(dim)
    } else {
        return [game, vmove]
    }
}

function reshuffle(game) {
    let bucket = [];
    for (var i = 0; i < game.length; i++) {
        for (var j = 0; j < game[i].length; j++) {
            if (game[i][j] !== -1) {
                bucket.push(game[i][j])
            }
        }
    }
    for (var i = 0; i < game.length; i++) {
        for (var j = 0; j < game[i].length; j++) {
            if (game[i][j] !== -1) {
                let random_index = Math.floor(Math.random() * bucket.length);
                game[i][j] = bucket.splice(random_index, 1)[0];
            }
        }
    }
} 

function in_array_dict(anarray, item) {
    let item_index = anarray.findIndex(function(element) {
        if (!arraysEqual(item.pos, element.pos)) {
            return false
        }
        if (item.dir !== element.dir) {
            return false
        }
        if (item.turns !== element.turns) {
            return false
        }
    })
    return (item_index > -1)
}

function calc_new_turns(old_dir, new_dir, current_turns) {
    if (old_dir === -1 | old_dir === new_dir) {
        return current_turns
    } else {
        return current_turns + 1
    }
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function shortest_path(game, point1, point2) { // path with shortest number of turns
    let queue = [];
    let parent = {};
    const start = {pos: point1, turns: 0, dir: -1};
    queue.push([start]);
    let visited = [];
    while (queue.length !== 0) {
        let current_path = queue.shift();
        let current = current_path[current_path.length - 1];
        if (current.turns > MAX_TURNS) {
            continue;
        }
        if (arraysEqual(current.pos, point2)) {
            return current_path;
        }
        visited.push(current)

        // push the up down left right into queue, push only if not in visited
        let up = [current.pos[0] - 1, current.pos[1]]
        let up_pt = {pos: up, turns: calc_new_turns(current.dir, "up", current.turns), dir: "up"}
        let down = [current.pos[0] + 1, current.pos[1]]
        let down_pt = {pos: down, turns: calc_new_turns(current.dir, "down", current.turns), dir: "down"}
        let left = [current.pos[0], current.pos[1] - 1]
        let left_pt = {pos: left, turns: calc_new_turns(current.dir, "left", current.turns), dir: "left"}
        let right = [current.pos[0], current.pos[1] + 1]
        let right_pt = {pos: right, turns: calc_new_turns(current.dir, "right", current.turns), dir: "right"}
        if (game[up[0]] !== undefined && game[up[0]][up[1]] !== undefined && (game[up[0]][up[1]] === -1 | arraysEqual(up, point2)) && !in_array_dict(visited, up_pt)) { 
            let new_path = current_path.slice();
            new_path.push(up_pt);
            queue.push(new_path);
        }
        if (game[down[0]] !== undefined && game[down[0]][down[1]] !== undefined && (game[down[0]][down[1]] === -1 | arraysEqual(down, point2)) && !in_array_dict(visited, down_pt)) { 
            let new_path = current_path.slice();
            new_path.push(down_pt);
            queue.push(new_path);
        }
        if (game[left[0]] !== undefined && game[left[0]][left[1]] !== undefined && (game[left[0]][left[1]] === -1 | arraysEqual(left, point2)) && !in_array_dict(visited, left_pt)) { 
            let new_path = current_path.slice();
            new_path.push(left_pt);
            queue.push(new_path);
        }
        if (game[right[0]] !== undefined && game[right[0]][right[1]] !== undefined && (game[right[0]][right[1]] === -1 | arraysEqual(right, point2)) && !in_array_dict(visited, right_pt)) { 
            let new_path = current_path.slice();
            new_path.push(right_pt);
            queue.push(new_path);
        }
    }
    return -1;
}


function destroy_animal(game, pos) {
    game[pos[0]][pos[1]] = -1;
    return game
}

function is_empty(game) {
    for (var i = 0; i < game.length; i++) {
        for (var j = 0; j < game[i].length; j++) {
            if (game[i][j] !== -1) { return false }
        }
    }
    return true
}

function find_valid_move(game) {
    for (var i = 0; i < game.length; i++) {
        for (var j = 0; j < game[i].length; j++) {
            let current = game[i][j];
            if (current === -1) { continue; }
            for (var i2 = i; i2 < game.length; i2++) {
                for (var j2 = 0; j2 < game.length; j2++) {
                    if (game[i][j] !== game[i2][j2]) { continue; }
                    if (i == i2 && j == j2) { continue; }
                    let res = shortest_path(game, [i, j], [i2, j2]);
                    if (res !== -1) {
                        return res;
                    }
                }
            }
        }
    }
    return null;
}


// level configs
function left_right_split(game) {
    let cols = game[0].length;
    for (var i = 0; i < game.length; i++) {
        let count_left = 0;
        let count_right = 0;
        for (var j = 0; j < cols/2; j++) {
            if (game[i][j] !== -1) {
                game[i][count_left + 1] = game[i][j];
                count_left += 1
            }
        }
        if (count_left < cols/2-1) {
            for (var c = count_left; c < cols/2-1; c++) {
                game[i][c+1] = -1
            }
        }
        for (var j = cols - 1; j >= cols/2; j--) {
            if (game[i][j] !== -1) {
                game[i][cols-count_right-2] = game[i][j];
                count_right += 1
            }
        }
        if (count_right < cols/2-1) {
            for (var c2 = count_right; c2 < cols/2-1; c2++) {
                game[i][cols-c2-2] = -1
            }
        }
    }
}

function up_down_split(game) {
    let cols = game.length;
    for (var i = 0; i < game[0].length; i++) {
        let count_left = 0;
        let count_right = 0;
        for (var j = 0; j < cols/2; j++) {
            if (game[j][i] !== -1) {
                game[count_left + 1][i] = game[j][i];
                count_left += 1
            }
        }
        if (count_left < cols/2-1) {
            for (var c = count_left; c < cols/2-1; c++) {
                game[c+1][i] = -1
            }
        }
        for (var j = cols - 1; j >= cols/2; j--) {
            if (game[j][i] !== -1) {
                game[cols-count_right-2][i] = game[j][i];
                count_right += 1
            }
        }
        if (count_right < cols/2-1) {
            for (var c2 = count_right; c2 < cols/2-1; c2++) {
                game[cols-c2-2][i] = -1
            }
        }
    }
}

function flush_left(game) {
    let cols = game[0].length;
    for (var i = 0; i < game.length; i++) {
        let count_left = 0;
        for (var j = 0; j < cols; j++) {
            if (game[i][j] !== -1) {
                game[i][count_left + 1] = game[i][j];
                count_left += 1
            }
        }
        if (count_left < cols-1) {
            for (var c = count_left; c < cols-1; c++) {
                game[i][c+1] = -1
            }
        }
    }
}

function flush_up(game) {
    let cols = game.length;
    for (var i = 0; i < game[0].length; i++) {
        let count_left = 0;
        for (var j = 0; j < cols; j++) {
            if (game[j][i] !== -1) {
                game[count_left + 1][i] = game[j][i];
                count_left += 1
            }
        }
        if (count_left < cols-1) {
            for (var c = count_left; c < cols-1; c++) {
                game[c+1][i] = -1
            }
        }
    }
}

function flush_right(game) {
    let cols = game[0].length;
    for (var i = 0; i < game.length; i++) {
        let count_right = 0;
        for (var j = cols - 1; j >= 1; j--) {
            if (game[i][j] !== -1) {
                game[i][cols-count_right-2] = game[i][j];
                count_right += 1
            }
        }
        if (count_right < cols-1) {
            for (var c2 = count_right; c2 < cols-1; c2++) {
                game[i][cols-c2-2] = -1
            }
        }
    }
}

function flush_down(game) {
    let cols = game.length;
    for (var i = 0; i < game[0].length; i++) {
        let count_right = 0;
        for (var j = cols - 1; j >= 1; j--) {
            if (game[j][i] !== -1) {
                game[cols-count_right-2][i] = game[j][i];
                count_right += 1
            }
        }
        if (count_right < cols-1) {
            for (var c2 = count_right; c2 < cols-1; c2++) {
                game[cols-c2-2][i] = -1
            }
        }
    }
}