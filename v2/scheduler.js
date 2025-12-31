// Stores the overall state of the scheduler.
let data = {
  // The number of days over which the schedule repeats.
  days: 1,

  // The events in the schedule.
  blocks: {
    /* Each block conforms to:
     * id (int32): {
     *   name: string
     *   duration: int32 (seconds)
     *   slots: [{
     *     day: int32
     *     time: int32 (seconds)
     *     locked: boolean
     *   }]
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
     *   name: string
     *   links: [
     *     { type: string w/ value "MUST"
     *       block: int32 (corresponding to data.blocks[i].id)
     *     }, ...
     *   ]
     * }
     */
  },
};

// For debugging purposes.
window.data = data;

// Calls `callback` when resource `id` is changed. Returns a closure to remove
// the listener.
export function listenToResource(id, callback) {
}

// Returns the id of the new block. The name of the returned block is
// "Block [ID]", and has one occurrence at day 0 time 0..
export function addBlock() {
}

// Calls `callback` when block `id` is changed. Returns a closure to remove
// the listener.
export function listenToBlock(id, callback) {
}

// Changes the name of a block.
export function renameBlock(id, name) {
}

// Change the number of slots a block has. If the number is decreased, existing
// slots will be deleted. If the number is increased, new slots will be added
// at day 0 time 0.
export function setBlockOccurrences(id, occurrences) {
}

// Unlinks all resources from a block and deletes it.
export function deleteBlock(id) {
}

// Returns the id of the new resource. The name of the returned resource is
// "R[ID]", and it is not linked to any blocks.
export function addResource() {
}

// Changes the name of a resource.
export function renameResource(id, name) {
}

// Deletes a resource. Any listeners on the resource will be called one final
// time.
export function deleteResource(id) {
}

// Links a resource to a block with a "MUST"-type constraint.
export function link(resourceId, blockId) {
}

// Deletes any existing "MUST"-type constraints between a resource and a block.
export function unlink(resourceId, blockId) {
}

// Sets the number of days in the schedule (minimum 1). If the number is
// decreased, anything currently scheduled beyond the last day will be
// rescheduled to its previous day modulo the new schedule length.
export function setNumberOfDays(days) {
}

// Undoes the prior add/remove/modify operation. First pushes the current state
// to the redo stack, then pops the state from the top of the undo stack and
// updates the current state to match. Calls the provided callbacks with the
// IDs of any newly-existing blocks and resources. It is safe for these
// callbacks to register listeners. Then, calls all existing modification
// listeners, regardless of whether the actual elements was modified in the
// undo. Does nothing if the undo stack was empty.
export function undo(newBlockCallback, newResourceCallback) {
}

// Similar to "undo", but undoes the prior undo operation, by moving the
// current state onto the undo stack and popping state from the redo stack,
// updating it to match. Calls the provided callbacks and modification
// listeners as in undo(). Does nothing if the redo stack is empty.
export function redo(newBlockCallback, newResourceCallback) {
}

// Returns the block if it exists, or undefined if it does not.
export function getBlock(id) {
}

// Returns the resource if it exists, or undefined if it does not.
export function getResource(id) {
}


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

// Returns the lowest unused block ID (starting at 1).
// O(N) time is fine for now.
function getNextBlockId() {
}

// Returns the lowest unused resource ID (starting at 1).
// O(N) time is fine for now.
function getNextResourceId() {
}


// Stores a deep clone of `data` to the undo stack and clears the redo stack.
// Each add/modify/delete action should call this after verifying preconditions
// (if any), but before modifying the current state.
function recordStateForUndo() {
}

// Stores the stack of closures to undo / redo operations. Each
// add/remove/modify action pushes the state of data to the stack and clears the
// redo stack. When
let undoStack = [];
let redoStack = [];
