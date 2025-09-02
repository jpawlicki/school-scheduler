/**
 * Usage: <tabbed-panel><div name="Tab 1">...</div>...</tabbed-panel>
 *
 * Creates a tabbed panel. The `name` attribute of each contained element will
 * be shown as the tab. The first tab is open by default. Any elements with a
 * "no-tab": "true" attribute won't have a navigation tab but can still be
 * shown with showTab(tabName).
 */
customElements.define("tabbed-panel", class extends HTMLElement {
  // Class properties:
  //   shadow: the shadow DOM root.

  connectedCallback() {
    const shadow = this.attachShadow({mode: "open"});
    this.shadow = shadow;
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction:row;
          max-height: 100%;
        }
        #nav {
          display: flex;
          flex-direction: column;
          background-color: #333;
          color: #ccc;
        }
        #nav > .active {
          background-color: #404040;
          color: #fff;
        }
        #nav > span:hover {
          color: #fff;
        }
        #nav > span {
          transition: all 0.2s;
          cursor: pointer;
          padding: .2em 1em .2em 1em;
        }
        #content {
          overflow: auto;
          max-height: 100%;
          background-color: #404040
        }
      </style>
      <div id="nav"></div>
      <div id="content"><slot></slot></div>
    `;
    const thisElement = this;
    let shown = false;
    for (let c of this.children) {
      if (c.getAttribute("no-tab") != "true") {
        const s = document.createElement("span");
        let name = c.getAttribute("name");
        s.appendChild(document.createTextNode(name));
        s.setAttribute("name", name);
        if (!shown) s.classList.toggle("active");
        shadow.querySelector("#nav").appendChild(s);
        s.addEventListener("click", () => thisElement.showTab(name));
        if (shown) c.style.display = "none";
        shown = true;
      } else {
        c.style.display = "none";
      }
    }
  }

  showTab(tabName) {
    for (let s of this.shadow.querySelectorAll("#nav > span")) {
      if (s.getAttribute("name") === tabName) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    }
    for (let s of this.children) {
      if (s.getAttribute("name") === tabName) {
        s.style.display = "unset";
      } else {
        s.style.display = "none";
      }
    }
  }
});
