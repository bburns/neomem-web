# Neomem

An information manager


## About

Spreadsheets are good for tabular information, while documents are good for free-form notes and outlines. Neomem makes it easy to switch between the two, allowing different views of the same information. 

For instance, tasks can have short properties like name, timeframe, order, estimate, which fit well in a table - while also having longer properties like notes. Switching between table and document views allows you to focus on one or the other as needed.

Data can be sorted, filtered, and grouped as required. 

All views will be developed as plugins. The backend can connect to multiple data sources, which will also be supported with plugins. 

Other views are possible for the same underlying information - chart, map, calendar, kanban, graph. Multiple views could be visible at the same time. A console view could allow traversal, querying, and manipulation of items in a text console. 


## Goals

- ui that gets out of the way, takes up little screen real estate, leaves room for editing
- document, table, and outline views of same information
- all views are plugins - document, table, outline, map, calendar, kanban, chart, graph, console
- plugin ecosystem for views and data sources - free/paid
- open source, with free to paid hosting plans


## Use Cases

- task manager - projects, tasks, goals, timeframe, order, estimate, actual, recurring tasks - switch between table, document, kanban, calendar views
- art travel planner - location (continent/country/state/city/museum), artist, date, name, rating, source, size, images - switch between table, map views
- screenplay/outline editor - acts, scenes, characters, locations - switch between table view, outline view, document view
- biographical timelines - subject, event, date, age, location - switch between table, document, map views
- comparison shopping - make quick tables for comparison between items, with space for free-form notes


## Inspiration

- Lotus Symphony (1990) - spreadsheet, chart, and document views of same information


## Implementation

- react frontend ui with view plugins
- graphql api with plugins for different data sources
- native data stored to a document db or postgres
- cloud db as a future datasource - host certain objects online to publish or share with others


## Features

- select text in notes, promote to item(s)
- move text and items easily to other items with alt-m commands


## Business Plan

- bootstrap - start simple - table view only, then document and outline
- set up paid hosting plans - store data in the cloud to access from multiple locations with secure backup
- set up plugin marketplace for views and data sources - free/paid plugins
- code will be open source on github


## Marketing

- have limited invites
- launch on product hunt, hacker news, reddit
