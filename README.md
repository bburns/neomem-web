# Neomem

A document/database information manager


## About

Spreadsheets are good for tabular information, not free-form notes - while documents are good for free-form notes, not tabular information. 

Need something that combines both, and makes it easy to switch between them - have different views of the same information. 

For instance, tasks can have short properties like name, timeframe, order, estimate, actual - while also having a free-form notes area.They can be viewed in a table, or switch to a document view to edit the notes with headers. 

Tables and documents could be sorted, filtered, and grouped as needed. 

Other views would be possible for the same underlying information - outline, chart, map, calendar, kanban, etc. Multiple views could be visible at the same time. 

A console view would allow traversal, querying, and manipulation of items in a text console. 


## Goals

- document, table, and outline views of same information
- all views are plugins - document, table, outline, map, calendar, kanban, chart, console, etc
- plugin ecosystem for views and data sources - free/paid
- open source, with free/paid hosting plans
- console view allows text commands via JavaScript or other languages


## Use Cases

- task manager - projects, tasks, goals, timeframe, order, estimate, actual, recurring tasks - switch between table, document, kanban, calendar views
- art travel planner - location (continent/country/state/city/museum), artist, date, name, rating, source, size, images - switch between table, map views
- screenplay/outline editor - acts, scenes, characters, locations - switch between a table view, outline view, document view
- biographical timelines - subject, event, date, age, location - switch between table, document, map views
- comparison shopping - make quick tables for comparison between items


## Implementation

- react frontend
- graphql api with plugins for different data sources
- native data stored to a document db? postgres?
- cloud db as another datasource - host certain objects online to publish or share with others


## Features

- select text in notes, promote to item
- move text and items easily with alt-m commands
