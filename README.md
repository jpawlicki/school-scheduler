This is a tool for organizing class schedules in an educational setting.

To use the tool, download index.html and then open it in a web browser.
Then, you can enter your classes in "blocks" and input your teachers and
students (or student cohorts) as "people". You can also put in other things
like rooms or equipment. Then, in the "links" view, indicate which people
are required for each block. Finally, use the "scheduler" view to experiment
with different schedules.


## Schedule View

In the schedule view, blocks can be dragged around (snapping to the nearest
10 minutes). You can shift-drag to drag a set of blocks at once, and swap them
with any set of blocks you drop them onto. (Release shift before releasing the
mouse button if you prefer to not swap.) You can also click blocks to lock or
unlock them. Locked blocks can't be dragged and won't be modified by any of the
tools.


### Schedule View Tools

**Improve** looks at existing conflicts and tries to reduce the number of
conflicts by swapping two blocks. If no swap exists, it looks whether any block
could simply be moved. It won't move a block to a time that no other block is
starting at.

**Resection** reallocates people between blocks that belong to the same "group".
For example, if you know 10 students need to take science, but it doesn't
matter whether they're in Science A, Science B, or Science C, you can put those
courses in, set them to have the same group name, and then the resection tool
will try to reduce conflicts by moving people between groups.

**Shuffle** randomly swaps blocks. It will usually create conflicts but can be
useful for breaking out of local maxima.

**Search** performs backtracking search over all possible schedule assignments
to find one with no conflicts. It will only work with very simple schedules,
for example schedules with only a few possible block times and a handful of
blocks.
