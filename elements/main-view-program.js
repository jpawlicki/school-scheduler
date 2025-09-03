/*
Usage: mainViewProgram(data, id);
*/

customElements.define('main-view-program', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
      </style>
      <div>
        Details about a program go here.
      </div>
    `;
  }

  connectedCallback() {
  }
});

export function mainViewProgram(data, id) {
  const e = document.createElement("main-view-program");
  return e;
}
