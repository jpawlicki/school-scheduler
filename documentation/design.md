# Design

This class scheduling application is designed for K-12 schools who are trying
to work out a class schedule that meets a number of hard constraints and soft
preferences.

Hard constraints include things such as: "Mrs. P teaches 7th Grade Science and
8th Grade Science, so the two classes can't be scheduled concurrently." Any 
schedules proposed by the application won't violate any hard constraints (if
possible), and will highlight any hard constraints that are violated.

Soft preferences include things such as: "Mr. L prefers to not have 8th-graders
before lunch." Soft preferences have weights, and the system tries to minimize
the number of soft preferences that are violated.

Any given schedule may create a number of **inferred constraints**, such as
"there's enough staff to teach 4 concurrent math and science classes" or "no
student taking Spanish 1 is also taking Pre-Algebra". If the user detects that
an inferred constraint doesn't match reality, they can create a imaginary student
or staff or similar to promote the inferred constraint's negation into a hard
constraint.

The app is implemented as a severless web app. State is saved in memory and
backed up to local storage. Users can import/export state via JSON.

Each class is assumed to take place at a specific time in a specific room with
specific staff and students present. Classes are separated by passing periods.

## Classes, Courses, Programs, and Curriculum

### Classes

The schedulable entities are **classes**. A class takes place at a particular
time in a particular place with particular students, teachers, etc. Classes are
assumed to repeat each week.

Example: "Mrs. H's Monday 5th-period Algebra I".

### Courses

Each class is part of a **course**. A course is a semester / year-long topic of
study. Courses have an expected duration (in years) and minimum/maximum lesson
time, and maximum number of students per lesson (class size).

Example: "Algebra I".

### Programs

Each course is part of a **program**. A program is a broad discipline. Programs
organize the courses, defining the planned path through the topic that students
will take. The plan may involve branches; for example, it may be possible for
a student to take two "accelerated" courses in place of three "grade-level"
courses, and wind up a grade level ahead of their peers in a particular program.
The organization of courses into programs helps the system create "imaginary
students" who help to encode scheduling constraints.

Example: "Math".

### Curriculum

The curriculum is the total set of programs offered by the school.

## Staff

Most (if not all) classes have to have staff present. Staff can't be in multiple
places at once. When the user creates a course, the staff requirement is
inferred and appropriate "imaginary staff members" are created. The user may
merge and name these imaginary staff members, which will help the scheduler
constrain better.

## Students

It's not intended that users enter individual student data, as that would be
too time-consuming and tedious. Instead, the system works with "student
archetypes" that represent groups of students the user cares about supporting.
Each archetype has a spot on each of the programs; for example, there may be
an archetypal student taking Spanish 1, Pre-Calc, AP Literature, etc.

## Scheduling

The overall schedule is broken down into schedule units. Schools that follow
the same schedule each day will use just one schedule unit. Schools that have
A/B days would have a schedule unit for A days and a schedule unit for B days.
Other schools might have a Monday/Wednesday, Tuesday/Thursday, and a Friday
scheduling units, or similar. Alternatively, a school might use scheduling units
for Fall Semester, Winter Semester, etc. Scheduling units are assumed to not
overlap.

Within a scheduling unit, there is a single vertical timeline representing the
school day. Every class in the system is in one of three states:
  1. Unallocated. This is the default state. Unallocated classes are kept in a
     floating titled tray ("Unallocated (5)") to the left of the main timeline.
     Unallocated classes exist in two states: unallocated to *any* scheduling
     unit, and unallocated to *this* scheduling unit. By default, the tray will
     show the unallocated-to-any classes only, but this can be toggled.
  2. Present somewhere on the timeline.
  3. Declared to be not taking place during this scheduling unit. These are still
     present in the tray, but hidden by default.

Each class on the timeline can be either "locked in" or "unlocked". Simply
clicking a class toggles its state. Unlocked classes can be dragged to different
times. Additionally, the app provides buttons for "shuffle" and "organize".

Shuffling the schedule randomizes the times of unlocked classes subject to all
known hard constraints.

Organizing the schedule repeatedly swaps the times of unlocked classes to try
to hill-climb any soft preferences. Once optimal, it will additionally hill-climb
built-in soft preferences, such as trying to maximize the overlap of prep periods
for teachers in the same program (to facilitate department meetings, etc). It
helps 

## UI

The following UI areas are needed:

  - A large, interactive grid track showing the actual schedule. The items on
    the display ought to be reorderable via manual intervention.
  - A notification area indicating what constraints or preferences are
    currently violated. This could also display getting-started help text or
    a user tutorial; or otherwise prompt the user toward the next action.
  - A system for editing programs (including loading/saving presets).
  - A system for editing staff members.
  - A system for editing virtual students.
  - A system for editing soft preferences.
  - Options to save and load the entire dataset, print pages, or export to
    Google Calendar.

To accomplish this, the UI is split as follows:

```
     /‾ max-content
    /      /‾ max-content   /‾ 1fr               /‾ fit-content
+------+-------+---------------------------+-----------+
| Tabs | Nouns | Main View                 | Inspector |
|      |       |                           |           |
|      |       |                           |           |
|      |       |                           |           |
|      |       |                           |           |
|      |       |                           |           | - 1fr
|      |       |                           |           |
|      |       |                           |           |
|      |       |                           |           |
|      |       |                           |           |
+------+-------+---------------------------+-----------+
| Status Footer                                        | - 2em
+------------------------------------------------------+
```

The user can split the main view by "popping out" inspector details to
a new main view:

```
      /‾ max-content
     /      /‾ max-content
    /      /          /‾ 1fr      /‾ 1fr         /‾ fit-content
+------+-------+-------------+-------------+-----------+
| Tabs | Nouns | Main View   | View 2      | Inspector |
|      |       |             |             |           |
|      |       |             |             |           |
|      |       |             |             |           |
|      |       |             |             |           |
|      |       |             |             |           | - 1fr
|      |       |             |             |           |
|      |       |             |             |           |
|      |       |             |             |           |
|      |       |             |             |           |
+------+-------+-------------+-------------+-----------+
| Status Footer                                        | - 2em
+------------------------------------------------------+
```

Tabs include:
  - File (Save/Load/Print/Export)
  - Schedule
  - Curriculum (Programs)
  - Staff
  - Students
  - Rooms
  - About/Contact/Legal

Subtabs & main page depend on the tab:
  - For "Schedule", depending on the schedule type (daily, M/W/F;T/R, A/B Block,
    etc), there will be a subtab for each schedule type (MWF, TR; or A, B, etc).
    The main page will display the selected schedule.
  - For "Programs", there will be a subtab for each program ("Math", "Science",
    etc). The main page will display the program.
  - For "Staff", there will be a subtab for each staff member / role. The main
    page will display that staff member's course assignments.
  - For "Students", there will be a list of student cohorts. The main page will
    display where in each of the courses that student is.
  - For "Rooms", there will be a list of classrooms. The main page will display
    their capability and schedule.
  - For "File", the subtabs are save/load/print. There is no main content.
    Alternatively, the subtabs are empty and it's all in the main content.
  - For "About/Contact/Legal", either the subtabs can break this down or it can
    all be in the main page.

For multiple tabs, the subtab list will include a "+" button for adding new
elements.

The Assist panel is a contextual workspace / editor. If a user has selected an
element in the main panel, the assist panel will co-locate the essential actions
and verbs for that element. This is most relevant when selecting classes in the
schedule view; the assist panel can show the teacher and room assignments (which
can then be edited).

If no element is selected, the assist panel can act as a space to tell the user
what to next and whether any constraints are violated, or to score the overall
performance of a schedule against the soft constraints.

### Other UI Considerations

When the user is looking at the schedule, and they have highlighted a teacher,
classes taught by that teacher should be visually clear (while others should fade
or shrink). Similar for rooms.

Where a class allocation violates a soft preference, the class itself could have
a small icon which (on mouseover) could indicate what the constraint is.
