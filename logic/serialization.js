export function loadData(json) {
  const data = JSON.parse(json);
  window.loaded_data = data;
  for (let clause of ["schedule_units", "classes", "courses", "programs", "staff", "students", "rooms"]) {
    for (let e of document.querySelectorAll(`extensible-list[data-schedule-noun="${clause}"]:not([data-schedule-populator="true"])`)) e.setLegalItems(data[clause]);
    for (let e of document.querySelectorAll(`extensible-list[data-schedule-noun="${clause}"][data-schedule-populator="true"]`)) {
      e.innerHTML = "";
      for (let item of data[clause]) {
        const li = document.createElement("li");
        li.setAttribute("value", item.id);
        li.textContent = item.name;
        e.appendChild(li);
      }
    }
  }
}

export function saveData() {
  // TODO
  window.alert("NYI");
}
