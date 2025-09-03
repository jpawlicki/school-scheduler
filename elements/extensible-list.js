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
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <style>
        :host > div {
          display: block;
          position: relative;
          padding: 0.5rem;
        }
        input[type="text"] {
          flex-grow: 1;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem;
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
      <div>
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

    this.shadow.getElementById("add-button").addEventListener("click", () => this.addItem());
    this.shadow.getElementById("add-input").addEventListener("keydown", e => {
      if (e.key === "Enter") this.addItem();
    });
    this.shadow.getElementById("filter").addEventListener("input", e => this.refilter(e.target.value));

    { // Element removal handlers.
      const removeButton = this.shadow.getElementById("remove");
      const ul = this.shadow.querySelector("ul");
      const thisElement = this;
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
          transition(() => thisElement.removeChild(removable));
          hoveredItem = null;
          removeButton.style.display = "none";
        }
      });
    }

    this.shadow.getElementById("filter").style.display = this.hasAttribute("filterable") ? "block" : "none";

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
      obs.disconnect();
      console.log(mutations);
      sort();
      obs.observe(this, {subtree: true, childList: true, characterData: true});
    });
    obs.observe(this, {subtree: true, childList: true, characterData: true});

    for (let e of this.children) if (e.style.viewTransitionName == "") e.style.viewTransitionName = `list-item-${this.nextId++}`;
  }

  static get observedAttributes() {
    return ["filterable"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let e = this.shadow.getElementById("filter");
    if (e != null) e.style.display = this.hasAttribute("filterable") ? "block" : "none";
  }

  addItem() {
    const addInput = this.shadow.getElementById("add-input");
    const item = addInput.value.trim();
    addInput.value = "";
    if (item.toLowerCase().indexOf(this.shadow.getElementById("filter").value.toLowerCase()) == -1) {
      this.shadow.getElementById("filter").value = "";
      this.refilter();
    }
    transition(() => {
      const li = document.createElement("li");
      li.textContent = item;
      li.style.viewTransitionName = `list-item-${this.nextId++}`;
      this.appendChild(li);
    });
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
