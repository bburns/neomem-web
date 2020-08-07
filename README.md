# Neomem

A document/database information manager / personal wiki


## About

Spreadsheets are good for tabular information, while documents are good for free-form notes. Would like something that combines both, and makes it easy to switch between them - have different views of the same information. 

For instance, tasks can have short properties like name, timeframe, order, estimate, actual, which fit well in a table - while also having a free-form notes. So tasks could be viewed in a table, or a document view to edit the notes with headers. 

Tables and documents could be sorted, filtered, and grouped as needed. 

Other views would be possible for the same underlying information - outline, chart, map, calendar, kanban. Multiple views could be visible at the same time. 

A console view would allow traversal, querying, and manipulation of items in a text console. 

All views would be developed as plugins for a base user interface.

The backend can connect to multiple data sources, which would also be supported through plugins. 


## Goals

- document, table, and outline views of same information
- all views are plugins - document, table, outline, map, calendar, kanban, chart, console
- plugin ecosystem for views and data sources - free/paid
- open source, with free to paid hosting plans
- console view allows text commands via JavaScript, SQL, or other languages


## Use Cases

- task manager - projects, tasks, goals, timeframe, order, estimate, actual, recurring tasks - switch between table, document, kanban, calendar views
- art travel planner - location (continent/country/state/city/museum), artist, date, name, rating, source, size, images - switch between table, map views
- screenplay/outline editor - acts, scenes, characters, locations - switch between a table view, outline view, document view
- biographical timelines - subject, event, date, age, location - switch between table, document, map views
- comparison shopping - make quick tables for comparison between items


## Implementation

- react frontend ui with view plugins
- graphql api with plugins for different data sources
- native data stored to a document db? postgres?
- cloud db as another datasource - host certain objects online to publish or share with others


## Features

- select text in notes, promote to item
- move text and items easily with alt-m commands


## Business Plan

- start simple - document and table views only, personal db backend for wiki usage - open source on github, but set up paid hosting plans [why? would only make sense if could collaborate with people]
- setup plugin marketplace - ui and data sources - free or paid plugins


## Marketing

- launch on product hunt, hacker news, reddit
- have limited invites
