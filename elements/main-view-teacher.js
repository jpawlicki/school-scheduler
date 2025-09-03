/*
Usage: mainViewTeacher(data, id);
*/

import { getItemById } from "../logic/main.js";

customElements.define('main-view-teacher', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
      </style>
      <div>
        <label>Name: <input id="name" type="text"></input></label>
      </div>
    `;
    this.shadow.querySelector("#name").addEventListener("input", e => {
      this.getItem().name = this.shadow.querySelector("#name").value;
      this.dispatchEvent(new CustomEvent("scheduler-data-updated", {composed: true, bubbles: true}));
    });
  }

  connectedCallback() {
    this.refresh();
  }

  linkData(data, id) {
    this.data = data;
    this.id = id;
  }

  getItem() {
    return getItemById(this.data, "staff", this.id);
  }

  refresh() {
    this.shadow.querySelector("#name").value = this.getItem().name;
  }
});

export function mainViewTeacher(data, id) {
  const e = document.createElement("main-view-teacher");
  e.linkData(data, id);
  return e;
}
