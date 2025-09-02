// Usage: <extensible-list filterable="true"><li>...</li>...</extensible-list>
//  The listed items can be clicked, which will bubble an event.

customElements.define("extensible-list", class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.nextId = 0;
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          padding-top: 1rem;
        }
        .controls {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        input[type="text"] {
          flex-grow: 1;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem;
        }
        #filter-input {
          margin-bottom: 0.25rem;
        }
        button {
          padding: 0.25rem;
          border: none;
          background-color: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #0056b3;
        }
        ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        ::slotted(li) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        ::slotted(li:hover) {
          background-color: #f5f5f5;
          color: #000;
        }
        li:hover .remove-btn {
          display: inline-block;
        }
        li .remove-btn {
          display: none;
          background-color: #dc3545;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
        }
        li .remove-btn:hover {
           background-color: #c82333;
        }
      </style>
      
      <div id="filter-container">
        <input type="text" id="filter-input" placeholder="Filter list...">
      </div>
      <div class="controls">
        <input type="text" id="add-input" placeholder="Add a new item...">
        <button id="add-btn">Add</button>
      </div>
      <ul id="item-list">
        <slot></slot>
      </ul>
    `;

    this._attachEventListeners();

    this.shadow.getElementById("filter-container").style.display = this.hasAttribute("filterable") ? "block" : "none";

    const sort = () => {
      // Sort child nodes.
      const children = Array.from(this.children).sort((a, b) => {
        const textA = a.textContent.toLowerCase();
        const textB = b.textContent.toLowerCase();
        if (textA < textB) return -1;
        if (textA > textB) return 1;
        return 0;
      });
      for (let c of children) {
        this.appendChild(c);
      }
    };
    sort();

    const obs = new MutationObserver(mutations => {
      let found = false;
      for (const m of mutations) if (m.type === "childList") found = true;
      if (found) {
        obs.disconnect();
        sort();
        obs.observe(this, {childList: true});
      }
    });
    obs.observe(this, {childList: true});

    for (let e of this.children) e.style.viewTransitionName = `list-item-${this.nextId++}`;
  }

  static get observedAttributes() {
    return ["filterable"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let e = this.shadow.getElementById("filter-container");
    if (e != null) e.style.display = this.hasAttribute("filterable") ? "block" : "none";
  }

  addItem() {
    const addInput = this.shadow.getElementById("add-input");
    const item = addInput.value.trim();
    addInput.value = "";
    const f = () => {
      const li = document.createElement("li");
      li.textContent = item;
      li.style.viewTransitionName = `list-item-${this.nextId++}`;
      this.appendChild(li);
    }
    if (!document.startViewTransition) f();
    else document.startViewTransition(f);
  }

  _attachEventListeners() {
    const shadow = this.shadow;
    const addBtn = shadow.getElementById("add-btn");
    const addInput = shadow.getElementById("add-input");
    const filterInput = shadow.getElementById("filter-input");
    const list = shadow.getElementById("item-list");

    addBtn.addEventListener("click", () => this.addItem());
    addInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.addItem();
    });

    // Filter list
    filterInput.addEventListener("input", (e) => {
      this._filterQuery = e.target.value;
      this.refresh();
    });
    
    // Handle clicks on list items (for selection and removal) using event delegation
    list.addEventListener("click", (e) => {
      const target = e.target;
      const itemValue = target.dataset.value;

      if (target.classList.contains("remove-btn")) {
        // Remove button was clicked
        if (window.confirm(`Are you sure you want to remove "${itemValue}"?`)) {
          this._removeItem(itemValue);
        }
      } else if (target.closest("li")) {
        // An item (or its text) was clicked
        this._selectItem(target.closest("li").dataset.value);
      }
    });
  }

  // --- Component Logic Methods ---
  
  _selectItem(itemValue) {
    // Create and dispatch the custom event
    const event = new CustomEvent("list-element-selected", {
      bubbles: true, // Allow event to bubble up through the DOM
      composed: true, // Allow event to cross the shadow DOM boundary
      detail: { 
        value: itemValue 
      }
    });
    this.dispatchEvent(event);
  }
});
