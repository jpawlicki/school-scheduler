/*
Usage: mainViewStudent(data, id);
*/

customElements.define('main-view-student', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
      </style>
      <div>
        Details about a student go here.
      </div>
    `;
  }

  connectedCallback() {
  }
});

export function mainViewStudent(data, id) {
  const e = document.createElement("main-view-student");
  return e;
}
