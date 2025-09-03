import { makeNounLink } from "../elements/noun-link.js";

export function loadData(json) {
  const data = JSON.parse(json);
  for (let clause of ["schedule_units", "classes", "courses", "programs", "staff", "students", "rooms"]) {
    for (let e of document.querySelectorAll(`extensible-list[data-schedule-noun="${clause}"]:not([data-schedule-populator="true"])`)) e.setLegalItems(data[clause]);
    for (let e of document.querySelectorAll(`extensible-list[data-schedule-noun="${clause}"][data-schedule-populator="true"]`)) {
      e.setItemFactory((name, value) => makeNounLink(clause, name, getNextIdentifier(data, clause)));
      e.innerHTML = "";
      for (let item of data[clause]) {
        e.appendChild(makeNounLink(clause, item.id, item.name));
      }
    }
  }
  return data;
}

export function saveData() {
  // TODO
  window.alert("NYI");
}

function getNextIdentifier(data, clause) {
  let max = -1;
  for (let i of data[clause]) max = Math.max(max, i.id);
  return max + 1;
}
