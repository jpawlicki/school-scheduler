*To organize the schedule is to organize the school.*

This is a tool for organizing class / bell schedules in an educational setting.
It is intended to be useful for administrators in American K-12 school systems.

The tool is intended to be easy to use - just enter your courses (or load a
preset) and you can start scheduling right away. The more it knows about your
school's situation, the more it can help define a schedule that meets your
specific needs: if you fill out what staff and classrooms you have available,
the tool can make sure no person or room is double-booked. And if you add a few
example students, the tool can help you make sure that you prevent or minimize
students who can't follow their expected tracks due to scheduling conflicts.

## TODO

  - The noun-populator <li>s should be links. When clicked, they'll open the
    item details in the main page. It's probably worth defining a custom element
    for them altogether, allowing both mouseover-highlighting and click to
    select. Especially if opening in either of the views is needed.
  - Need to define a main-view thing per noun, and a contextual panel view
    per noun-pair.

The following custom elements are needed:

A **timeline viewer**, which displays a vertical timeline. Boxes can be dragged
around on the timeline. They should snap nicely to each other. Some boxes (e.g.
"passing time" may be quite thin (2-3 minutes long). The unit for the timeline
should be customizable; a minute (or at least quarter-hourly) unit is needed for
the timeline itself, and a grade unit is needed for program organization. The
viewer also needs an organized tray of unallocated and out-of-scope items. The
element should also have a read-only mode for use in co-locating information.

A **detail editor** for editing the nouns. This may be able to parse the JSON
schema directly to automatically build a simple form.

The following utility functions are likely needed:

  - Given the full data model and a class, compute a unique class label ("biology" unless that's ambiguous, then "Mrs. P's biology", then "Mrs. P's 4th-period biology", etc.)

