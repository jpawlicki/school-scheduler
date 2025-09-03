/*
Usage: <extensible-list filterable="true"><li>...</li>...</extensible-list>

The list items will be maintained in sorted lexical order.
The list will show a filter if and only if filterable="true".
The list will show an remove button that can be used to remove elements.

By default, any text can be added to the list. However, if you call the
`.setLegalItems(x)` method, where x is of the form:
    [
      {name: "text string", id: serializable_value, ...},
      ...
    ]
then the input will be replaced with a select containing options named by
the names and valued by ids. Adding elements in this case will add new
<li value="${id}">${name}</li> to the list. The array is captured by
reference you may update it freely.

Illegal items will not be automatically removed from the list, but it will
not be possible to add new ones. Illegal items can be pruned from the list
(or have their names updated) by calling `.removeIllegalItems()`.
*/

customElements.define("extensible-list", class extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.nextId = 0;
    this.legalItems = null;
    this.legalItemsMap = null;
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <style>
        :host > div {
          display: block;
          position: relative;
          padding: 0.5rem;
        }
        input[type="text"], select {
          flex-grow: 1;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem;
          min-width: 100px;
        }
        #filter {
          margin-bottom: 0.25rem;
        }
        #add-button {
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
          margin: .25rem 0 0 0;
          padding: 0;
        }
        ::slotted(li) {
          padding-left: 1rem;
        }
        #remove {
          position: absolute;
          top: 0;
          left: .55rem;
          display: none;
          text-align: center;
          margin: 0;
          padding: 0;
          border: 0;
          cursor: pointer;
          width: 1em;
          height: 1em;
        }
      </style>
      <div id="container">
        <div>
          <input type="text" id="filter" placeholder="Filter">
        </div>
        <input type="text" id="add-input" placeholder="Add a new item...">
        <button id="add-button">Add</button>
        <ul>
          <slot></slot>
        </ul>
        <svg id="remove" aria-label="Remove item" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#fff"/></svg>
      </div>
    `;

    const container = this.shadow.getElementById("container");
    container.addEventListener("click", e => {
      if (e.target.id === "add-button") this.addItem();
    });
    container.addEventListener("keydown", e => {
      if (e.target.id === "add-input" && e.key === "Enter") this.addItem();
    });
    this.shadow.getElementById("filter").addEventListener("input", e => this.refilter(e.target.value));

    // Refresh select options on click/focus
    container.addEventListener("mousedown", e => {
      if (e.target.id === "add-input" && e.target.tagName === "SELECT") {
        this._syncSelectOptions();
      }
    });

    { // Element removal handlers.
      const removeButton = this.shadow.getElementById("remove");
      const ul = this.shadow.querySelector("ul");
      let hoveredItem = null;

      ul.addEventListener("mouseover", e => {
        const t = e.target.closest("li");
        if (t && this.contains(t)) {
          hoveredItem = t;
          removeButton.style.display = "block";
          removeButton.style.top = `${t.offsetTop}px`;
        }
      });

      ul.addEventListener("mouseleave", e => {
        if (e.relatedTarget === removeButton) return;
        hoveredItem = null;
        removeButton.style.display = "none";
      });

      removeButton.addEventListener("click", () => {
        if (hoveredItem) {
          const removable = hoveredItem;
          transition(() => {
            this.removeChild(removable);
            this._syncSelectOptions();
          });
          hoveredItem = null;
          removeButton.style.display = "none";
        }
      });
    }

    this.shadow.getElementById("filter").style.display = this.hasAttribute("filterable") ? "block" : "none";

    const sort = () => {
      const children = Array.from(this.children).sort((a, b) => {
        const textA = a.textContent.toLowerCase();
        const textB = b.textContent.toLowerCase();
        if (textA < textB) return -1;
        if (textA > textB) return 1;
        return 0;
      });
      for (let c of children) this.appendChild(c);
    };
    sort();

    const obs = new MutationObserver(() => {
      obs.disconnect();
      sort();
      obs.observe(this, { subtree: true, childList: true, characterData: true });
    });
    obs.observe(this, { subtree: true, childList: true, characterData: true });

    for (let e of this.children) if (e.style.viewTransitionName == "") e.style.viewTransitionName = `list-item-${this.nextId++}`;
  }

  _syncSelectOptions() {
    if (!this.legalItems) return;

    const addInput = this.shadow.getElementById("add-input");
    const addButton = this.shadow.getElementById("add-button");

    if (addInput.tagName !== "SELECT") return;

    const currentItemValues = new Set(
      Array.from(this.children).map(li => li.getAttribute("value"))
    );

    addInput.innerHTML = ""; // Clear existing options

    // Repopulate with legal items that are NOT currently in the list
    for (const item of this.legalItems) {
      if (!currentItemValues.has(String(item.id))) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        addInput.appendChild(option);
      }
    }

    // Handle placeholder for an empty select
    if (addInput.options.length === 0) {
      const placeholder = document.createElement("option");
      placeholder.textContent = "All items added";
      placeholder.disabled = true;
      addInput.appendChild(placeholder);
      addButton.disabled = true;
    } else {
      addButton.disabled = false;
    }
  }

  setLegalItems(items) {
    this.legalItems = items;
    this.legalItemsMap = new Map(items.map(item => [String(item.id), item.name]));
    const oldInput = this.shadow.getElementById("add-input");
    const selectInput = document.createElement("select");
    selectInput.id = "add-input";
    oldInput.replaceWith(selectInput);
    this._syncSelectOptions(); // Initial population of select options
  }

  removeIllegalItems() {
    if (!this.legalItemsMap) return;
    const toRemove = [], toUpdate = [];

    for (const li of this.children) {
      const id = li.getAttribute("value");
      if (this.legalItemsMap.has(id)) {
        const correctName = this.legalItemsMap.get(id);
        if (li.textContent !== correctName) toUpdate.push({ li, correctName });
      } else {
        toRemove.push(li);
      }
    }

    if (toRemove.length > 0 || toUpdate.length > 0) {
      transition(() => {
        toUpdate.forEach(item => item.li.textContent = item.correctName);
        toRemove.forEach(li => this.removeChild(li));
        this._syncSelectOptions(); // Resync after pruning
      });
    }
  }

  addItem() {
    const addInput = this.shadow.getElementById("add-input");
    let newItemConfig = {};

    if (addInput.tagName === "SELECT") {
      if (addInput.options.length === 0 || addInput.selectedIndex === -1) return;
      const selectedOption = addInput.options[addInput.selectedIndex];
      if (selectedOption.disabled) return; // Don't add the placeholder
      newItemConfig = { value: selectedOption.value, text: selectedOption.textContent };
    } else {
      const text = addInput.value.trim();
      if (!text) return;
      newItemConfig = { text };
      addInput.value = "";
    }

    if (newItemConfig.text.toLowerCase().indexOf(this.shadow.getElementById("filter").value.toLowerCase()) === -1) {
      this.shadow.getElementById("filter").value = "";
      this.refilter();
    }

    const update = () => {
      const li = document.createElement("li");
      li.textContent = newItemConfig.text;
      if (newItemConfig.value !== undefined) li.setAttribute("value", newItemConfig.value);
      li.style.viewTransitionName = `list-item-${this.nextId++}`;
      this.appendChild(li);
      this._syncSelectOptions();
    };

    // Skip the transition if this is the final item of the list; the cross-fade looks like lag.
    let lastValue = null;
    if (this.lastChild != null) lastValue = this.lastChild.textContent;
    if (lastValue != null && newItemConfig.text < lastValue) transition(update);
    else update();
  }

  static get observedAttributes() { return ["filterable"]; }
  attributeChangedCallback(name, oldValue, newValue) {
    let e = this.shadow.getElementById("filter");
    if (e != null) e.style.display = this.hasAttribute("filterable") ? "block" : "none";
  }

  refilter() {
    const filterValue = this.shadow.getElementById("filter").value.toLowerCase();
    for (let e of this.children) {
      e.style.display = e.textContent.toLowerCase().indexOf(filterValue) != -1 ? "list-item" : "none";
    }
  }
});

function transition(callback) {
  if (!document.startViewTransition) callback();
  else document.startViewTransition(callback);
}
