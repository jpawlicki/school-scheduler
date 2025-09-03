/*
Usage: <noun-link value="some_id" type="noun_type">Name</noun-link>
Or makeNounLink(type, id, name);

If the element is contained by a node with any of these classes, it will show
arrows and functionality to promote it to a main display:
  .left-shell: show both > and >> arrows.
  .left-view: show > arrow, which promotes to right view.
  .right-view: show < arrow, which promotes to left view.
  .right-shell: show both << and < arrows.

When a user clicks one of these arrows (or simply clicks the element if only
one arrow is shown), this element bubbles a "scheduler-show-noun" event with
the following `detail` field:
{
  panel: "left" or "right" or "contextual"
  type: (this type),
  id: (this id),
  name: (this name)
}
*/

customElements.define('noun-link', class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>
        :host(noun-link) {
          display: list-item;
        }
        div {
          display: flex;
          flex-direction: row;
        }
        div:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        span {
          flex-grow: 1;
          cursor: pointer;
        }
        svg {
          height: 1em;
          display: none;
          cursor: pointer;
        }
        svg:hover path {
          opacity: 100%;
        }
        #rr {
          display: var(--noun-link-rr-display);
        }
        #r {
          display: var(--noun-link-r-display);
        }
        #ll {
          display: var(--noun-link-ll-display);
        }
        #l {
          display: var(--noun-link-l-display);
        }
        path {
          fill: currentColor;
          opacity: 50%;
        }
        .forbid-contextual:hover + svg path {
          opacity: 100%;
        }
      </style>
      <div>
        <svg id="ll" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M440-240 200-480l240-240 56 56-183 184 183 184-56 56Zm264 0L464-480l240-240 56 56-183 184 183 184-56 56Z"/></svg>
        <svg id="l" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
        <span><slot></slot></span>
        <svg id="r" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
        <svg id="rr" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M383-480 200-664l56-56 240 240-240 240-56-56 183-184Zm264 0L464-664l56-56 240 240-240 240-56-56 183-184Z"/></svg>
      </div>
    `;
    const thisElement = this;
    this.shadow.querySelector("#ll").addEventListener("click", () => thisElement.show("left"));
    this.shadow.querySelector("#l").addEventListener("click", () => thisElement.show("right"));
    this.shadow.querySelector("#rr").addEventListener("click", () => thisElement.show("right"));
    this.shadow.querySelector("#r").addEventListener("click", () => thisElement.show("left"));
    this.shadow.querySelector("span").addEventListener("click", () => thisElement.show("contextual"));
    this.allowContextual = true;
  }

  show(spot) {
    if (!this.allowContextual && spot == "contextual") spot = "left";
    this.dispatchEvent(new CustomEvent("scheduler-show-noun", {composed: true, bubbles: true, detail: { id: parseInt(this.getAttribute("value")), type: this.getAttribute("type"), name: this.textContent, panel: spot }}));
  }

  connectedCallback() {
    let p = this.parentNode;
    while (p && !p.classList.contains("left-shell")) p = p.parentNode;
    this.allowContextual = p == null;
    this.shadow.querySelector("span").setAttribute("class", this.allowContextual ? "" : "forbid-contextual");
  }
});

export function makeNounLink(type, id, name) {
  const e = document.createElement("noun-link");
  e.appendChild(document.createTextNode(name));
  e.setAttribute("type", type);
  e.setAttribute("value", id);
  return e;
}
