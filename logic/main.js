import { mainViewSchedule } from "../elements/main-view-schedule.js";
import { mainViewProgram } from "../elements/main-view-program.js";
import { mainViewTeacher } from "../elements/main-view-teacher.js";
import { mainViewStudent } from "../elements/main-view-student.js";
import { mainViewRoom } from "../elements/main-view-room.js";

// Show the element `data[type][*].id=id` in `spot`. `spot` may be "left", "right", or "contextual".
export function showItem(data, type, id, spot, left, right, context) {
  let target = spot == "contextual" ? context : spot == "right" ? right : left;
  let func = {
    "schedule_units": mainViewSchedule,
    "programs": mainViewProgram,
    "staff": mainViewTeacher,
    "students": mainViewStudent,
    "rooms": mainViewRoom,
  }[type];

  if (type == "schedule_units" && spot == "contextual") target = left;

  if (func) {
    target.innerHTML = "";
    target.appendChild(func(data, id));
  }
}

export function getItemById(data, type, id) {
  for (let i of data[type]) if (i.id == id) return i;
  return null;
}

// Render schedule with `id` from `data`, in `panel`.
export function showSchedule(data, id, panel) {
  // 
}
