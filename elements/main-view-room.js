/*
Usage: mainViewRoom(data, id);
*/

customElements.define('main-view-room', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
      </style>
      <div>
        Details about a room go here.
      </div>
    `;
  }

  connectedCallback() {
  }
});

export function mainViewRoom(data, id) {
  const e = document.createElement("main-view-room");
  return e;
}
