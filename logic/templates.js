export const TEMPLATES = {
  "test": {
    "schedule_units": [
      {"id": 0, "name": "M/W/F"},
      {"id": 1, "name": "T/R"},
    ],
    "classes": [
    ],
    "courses": [
      {"id": 0, "name": "Pre-Algebra"},
      {"id": 1, "name": "Algebra 1"},
      {"id": 2, "name": "Geometry"},
      {"id": 3, "name": "Algebra 2"},
    ],
    "programs": [
      {"id": 0, "name": "Mathematics", "courses": [
        {"course": 0, "time_start": 6, "time_end": 7},
        {"course": 1, "time_start": 7, "time_end": 8},
        {"course": 2, "time_start": 8, "time_end": 9},
        {"course": 3, "time_start": 9, "time_end": 10},
      ]},
    ],
    "staff": [
      {"id": 0, "name": "Alice Sazowiki"},
      {"id": 1, "name": "Bob Tabriz"},
      {"id": 2, "name": "Eve Pichai"},
    ],
    "students": [
      {"id": 0, "name": "Standard 6th Grader"},
    ],
    "rooms": [
      {"id": 0, "name": "A29", "capacity": 20},
    ]
  }
};
