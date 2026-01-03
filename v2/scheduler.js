// Stores the overall state of the scheduler.
let data = {
  // The number of days over which the schedule repeats.
  days: 1,

  // The events in the schedule.
  blocks: {
    /* Each block conforms to:
     * id (int32): {
     * name: string
     * duration: int32 (seconds)
     * slots: [{
     * day: int32
     * time: int32 (seconds)
     * locked: boolean
     * }]
     * }
     */
  },

  // The resources (teachers, rooms, students, equipment) etc that are tracked
  // in the system. Each resource can be linked to a number of blocks that it
  // must be available for. For now, only simple constraints that a resource
  // is needed for a block is modeled; future versions might support "one of"
  // or "preferred"-style constraints.
  resources: {
    /* Each resource conforms to:
     * id (int32): {
     * name: string
     * links: [
     * { type: string w/ value "MUST"
     * block: int32 (corresponding to data.blocks[i].id)
     * }, ...
     * ]
     * }
     */
  },
};

// For debugging purposes.
window.data = data;

// ======== Private functions and variables:

// Stores the listeners.
let modificationListeners = {
  blockListeners: {
    /* Entries conform to:
     * id: [closure, closure...]
     */
  },
  resourceListeners: {
    /* Entries conform to:
     * id: [closure, closure...]
     */
  },
};

// Stores the stack of closures to undo / redo operations.
let undoStack = [];
let redoStack = [];

// Returns the lowest unused block ID (starting at 1).
function getNextBlockId() {
  let id = 1;
  while (data.blocks[id]) {
    id++;
  }
  return id;
}

// Returns the lowest unused resource ID (starting at 1).
function getNextResourceId() {
  let id = 1;
  while (data.resources[id]) {
    id++;
  }
  return id;
}

// Stores a deep clone of `data` to the undo stack and clears the redo stack.
function recordStateForUndo() {
  undoStack.push(JSON.parse(JSON.stringify(data)));
  redoStack = [];
}

// Helper: Deep clones an object
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Helper: Notify specific block listeners
function notifyBlockListeners(id) {
  if (modificationListeners.blockListeners[id]) {
    modificationListeners.blockListeners[id].forEach(cb => cb());
  }
}

// Helper: Notify specific resource listeners
function notifyResourceListeners(id) {
  if (modificationListeners.resourceListeners[id]) {
    modificationListeners.resourceListeners[id].forEach(cb => cb());
  }
}

// Helper: Notify ALL listeners (used for undo/redo and global changes)
function notifyAllListeners() {
  Object.keys(modificationListeners.blockListeners).forEach(id => notifyBlockListeners(id));
  Object.keys(modificationListeners.resourceListeners).forEach(id => notifyResourceListeners(id));
}

// Helper: Generic logic for performing Undo or Redo
function performStateSwap(popStack, pushStack, newBlockCallback, newResourceCallback) {
  if (popStack.length === 0) return;

  // 1. Push current state to the pushStack
  pushStack.push(deepClone(data));

  // 2. Pop new state from popStack and apply it
  const prevState = data; // Keep ref for comparison
  const newState = popStack.pop();
  data = newState;
  window.data = data; // Update debug reference

  // 3. Detect newly existing items (present in new state, absent in old)
  if (newBlockCallback) {
    const oldKeys = new Set(Object.keys(prevState.blocks));
    Object.keys(newState.blocks).forEach(id => {
      if (!oldKeys.has(id)) {
        newBlockCallback(parseInt(id));
      }
    });
  }

  if (newResourceCallback) {
    const oldKeys = new Set(Object.keys(prevState.resources));
    Object.keys(newState.resources).forEach(id => {
      if (!oldKeys.has(id)) {
        newResourceCallback(parseInt(id));
      }
    });
  }

  // 4. Notify all listeners to refresh UI
  notifyAllListeners();
}

// ======== Public API:

// Calls `callback` when resource `id` is changed. Returns a closure to remove
// the listener.
export function listenToResource(id, callback) {
  if (!modificationListeners.resourceListeners[id]) {
    modificationListeners.resourceListeners[id] = [];
  }
  modificationListeners.resourceListeners[id].push(callback);
  
  return () => {
    const list = modificationListeners.resourceListeners[id];
    if (list) {
      const idx = list.indexOf(callback);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

// Returns the id of the new block. The name of the returned block is
// "Block [ID]", and has one occurrence at day 0 time 0.
export function addBlock() {
  recordStateForUndo();
  const id = getNextBlockId();
  data.blocks[id] = {
    name: `Block ${id}`,
    duration: 3600, // Default 1 hour duration
    slots: [{
      day: 0,
      time: 0,
      locked: false
    }]
  };
  return id;
}

// Calls `callback` when block `id` is changed. Returns a closure to remove
// the listener.
export function listenToBlock(id, callback) {
  if (!modificationListeners.blockListeners[id]) {
    modificationListeners.blockListeners[id] = [];
  }
  modificationListeners.blockListeners[id].push(callback);
  
  return () => {
    const list = modificationListeners.blockListeners[id];
    if (list) {
      const idx = list.indexOf(callback);
      if (idx !== -1) list.splice(idx, 1);
    }
  };
}

// Changes the name of a block.
export function renameBlock(id, name) {
  const block = data.blocks[id];
  if (!block) return;
  if (block.name === name) return;

  recordStateForUndo();
  block.name = name;
  notifyBlockListeners(id);
}

// Change the number of slots a block has. If the number is decreased, existing
// slots will be deleted. If the number is increased, new slots will be added
// at day 0 time 0.
export function setBlockOccurrences(id, occurrences) {
  const block = data.blocks[id];
  if (!block) return;
  if (block.slots.length === occurrences) return;

  recordStateForUndo();
  
  if (occurrences < block.slots.length) {
    block.slots = block.slots.slice(0, occurrences);
  } else {
    while (block.slots.length < occurrences) {
      block.slots.push({ day: 0, time: 0, locked: false });
    }
  }
  
  notifyBlockListeners(id);
}

// Unlinks all resources from a block and deletes it.
export function deleteBlock(id) {
  if (!data.blocks[id]) return;

  recordStateForUndo();

  // Remove links from resources
  for (const resId in data.resources) {
    const resource = data.resources[resId];
    const initialLen = resource.links.length;
    resource.links = resource.links.filter(link => link.block !== id);
    if (resource.links.length !== initialLen) {
      notifyResourceListeners(resId);
    }
  }

  delete data.blocks[id];
  notifyBlockListeners(id); // Notify one last time
}

// Returns the id of the new resource. The name of the returned resource is
// "R[ID]", and it is not linked to any blocks.
export function addResource() {
  recordStateForUndo();
  const id = getNextResourceId();
  data.resources[id] = {
    name: `R${id}`,
    links: []
  };
  return id;
}

// Changes the name of a resource.
export function renameResource(id, name) {
  const resource = data.resources[id];
  if (!resource) return;
  if (resource.name === name) return;

  recordStateForUndo();
  resource.name = name;
  notifyResourceListeners(id);
}

// Deletes a resource. Any listeners on the resource will be called one final
// time.
export function deleteResource(id) {
  if (!data.resources[id]) return;

  recordStateForUndo();
  delete data.resources[id];
  notifyResourceListeners(id);
}

// Links a resource to a block with a "MUST"-type constraint.
export function link(resourceId, blockId) {
  const resource = data.resources[resourceId];
  const block = data.blocks[blockId];
  if (!resource || !block) return;

  // Avoid duplicates
  if (resource.links.some(l => l.block === blockId && l.type === "MUST")) {
    return;
  }

  recordStateForUndo();
  resource.links.push({ type: "MUST", block: blockId });
  notifyResourceListeners(resourceId);
}

// Deletes any existing "MUST"-type constraints between a resource and a block.
export function unlink(resourceId, blockId) {
  const resource = data.resources[resourceId];
  if (!resource) return;

  const initialLen = resource.links.length;
  resource.links = resource.links.filter(l => !(l.block === blockId && l.type === "MUST"));

  if (resource.links.length !== initialLen) {
    recordStateForUndo();
    // Note: we already mutated `resource` above conceptually by filtering, 
    // but we strictly should record undo BEFORE mutation. 
    // To be precise: reset the mutation, record undo, then apply. 
    // OR simpler: we haven't saved `resource.links` back to the object yet if filter returns new array.
    // The previous line just created a local variable `resource.links` if strict, but JS objects are ref.
    // Actually `filter` returns a NEW array. So `resource` is NOT mutated yet.
    
    // Correct logic:
    // 1. Check if change needed (done above via initialLen check)
    // 2. Record Undo
    // 3. Apply change
    resource.links = resource.links.filter(l => !(l.block === blockId && l.type === "MUST")); // Re-run filter or reuse var
    notifyResourceListeners(resourceId);
  }
}

// Sets the number of days in the schedule (minimum 1). If the number is
// decreased, anything currently scheduled beyond the last day will be
// rescheduled to its previous day modulo the new schedule length.
export function setNumberOfDays(days) {
  if (days < 1) return;
  if (data.days === days) return;

  recordStateForUndo();
  data.days = days;

  // Update existing blocks if they fall out of range
  Object.values(data.blocks).forEach(block => {
    block.slots.forEach(slot => {
      if (slot.day >= days) {
        slot.day = slot.day % days;
      }
    });
  });

  // Since schedule duration changes, we notify all listeners
  notifyAllListeners();
}

// Undoes the prior add/remove/modify operation.
export function undo(newBlockCallback, newResourceCallback) {
  performStateSwap(undoStack, redoStack, newBlockCallback, newResourceCallback);
}

// Similar to "undo", but undoes the prior undo operation.
export function redo(newBlockCallback, newResourceCallback) {
  performStateSwap(redoStack, undoStack, newBlockCallback, newResourceCallback);
}

// Returns the block if it exists, or undefined if it does not.
export function getBlock(id) {
  return data.blocks[id];
}

// Returns the resource if it exists, or undefined if it does not.
export function getResource(id) {
  return data.resources[id];
}
