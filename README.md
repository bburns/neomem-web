# Neomem

An open-source information manager


## About

Spreadsheets are good for tabular information, while documents are good for free-form notes and outlines. Neomem makes it easy to switch between the two, allowing different views of the same information. 

For example, tasks can have short properties like name, timeframe, order, estimate, which fit well in a table - while also having longer properties like notes. Switching between table and document views allows you to focus on one or the other as needed.

Data can be filtered, grouped, and sorted as required. 

Other views are possible for the same underlying information - chart, map, calendar, kanban, graph. Multiple views could be visible at the same time. A console view could allow traversal, querying, and manipulation of items in a text console. 

All views will be developed as plugins. The backend can connect to multiple data sources, which will also be supported with plugins. 


## Goals

- clutter-free ui that gets out of the way, leaves room for editing
- document, table, and outline views of same information
- all views are plugins - document, table, outline, map, calendar, kanban, chart, graph, timeline, console
- open source with paid hosting plans
- plugin ecosystem for views and data sources - free/paid


## Use Cases

Some use cases to test the app and database structure -

- task manager - projects, tasks, goals, timeframe, order, estimate, actual, recurring tasks - switch between table, document, kanban, calendar, timeline views
- art travel planner - location (continent/country/state/city/museum), artist, date, name, rating, source, size, images - switch between table, map views
- screenplay/outline editor - acts, scenes, characters, locations
- biographical timelines - subject, event, date, age, location - switch between table, document, map views
- comparison shopping - make quick tables for comparison between items, with free-form notes
- genealogy - add properties to relationships, e.g. marriage date and location


## Inspiration

- Lotus Symphony (1990) - spreadsheet, chart, and document views of same information
- Airtable - advanced table editor


## Implementation

- react frontend ui with view plugins
- graphql api with plugins for different data sources
- native data stored to neo4j in google cloud - access data anywhere


## Features

- select text in notes, promote to item(s) with alt-m command
- move text and items easily to other items with alt-m command
- create new items quickly with alt-n command, put in an inbox
- go to item quickly with alt-g command, start typing to filter list
- clipboard monitor - paste contents when it changes


## Business Plan

- bootstrap - start simple - table view only, then document and outline
- set up paid hosting plans - store data in the cloud to access from any location with secure backup
- set up plugin marketplace for views and data sources - free/paid plugins
- setup github sponsor account, paypal, patreon etc


## Marketing

- make landing page to gather emails for mailing list
- post to twitter, medium, reddit, neo4j community for feedback
- launch on product hunt, hacker news, reddit
- have limited invites
