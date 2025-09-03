/*
Usage: mainViewSchedule(data, id);
*/

customElements.define('main-view-schedule', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
      </style>
      <div>
        Details about a schedule go here.
      </div>
    `;
  }

  connectedCallback() {
  }
});

export function mainViewSchedule(data, id) {
  const e = document.createElement("main-view-schedule");
  return e;
}
