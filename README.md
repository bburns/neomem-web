# Neomem

An open-source information manager


## About

Spreadsheets are good for tabular information, while documents are good for free-form notes and outlines. Neomem makes it easy to switch between the two, allowing different views of the same information. 

For example, tasks can have short properties like name, timeframe, order, estimate, which fit well in a table - while also having longer properties like notes. Switching between table and document views allows you to focus on one or the other as needed.

Data can be filtered, grouped, and sorted as required. 

Other views are possible for the same underlying information - chart, map, calendar, kanban, graph. Multiple views could be visible at the same time. A console view could allow exploration and manipulation of items in a text console. 

All views will be developed as plugins. The backend can connect to multiple data sources, which will also be supported with plugins. Different overlapping domains can be modelled. A plugin ecosystem will allow sharing and development of them all as npm packages. 


## Goals

- clutter-free ui that gets out of the way, leaves room for editing
- different views of same information - document, table, outline, map, calendar, kanban, chart, graph, timeline, console
- handle different datasources - neo4j db, xml, filesystem, email, github
- handle different overlapping domains with simple and extensible datamodels - task management, collection management
- all views, datasources, and domains are npm packages
- open source with paid hosting plans
- online plugin ecosystem/marketplace for views, datasources, and domains - free/paid


## Use Cases

Some use cases to test the app and database structure -

- task manager - projects, tasks, goals, timeframe, estimate, actual, recurring tasks - switch between table, document, kanban, calendar, timeline views
- comparison shopping - make quick tables for comparison between items, with free-form notes
- art travel planner - location (continent/country/state/city/museum), artist, date, name, rating, source, size, images - switch between table, map views
- screenplay/outline editor - acts, scenes, characters, locations
- biographical timelines - subject, event, date, age, location - switch between table, document, map views
- genealogy - add properties to relationships, e.g. marriage date and location


## Inspiration

- Lotus Symphony (1990) - spreadsheet, chart, and document views of same information
- Airtable - advanced table editor
- Apple II, Zork, Linux cli, IPython - for console interface


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


## Milestones

Do monthly releases - like tabulator. Track in Trello or github project, then eventually Neomem kanban. 

- September - table view, neo4j datasource, task domain - refactor code, get good architecture for plugins and db, investigate sharing/security

- October - document view, xml datasource
- November - kanban view, host in cloud, investigate scalability and costs
- December - website, onboarding/payment/hosting process, first public release
- January - setup online marketplace for views, datasources, packages
- February - sharing items / collaborative editing / live views of db



## Business Plan

- bootstrap - start simple - table view only, then document and outline
- set up paid hosting plans - store data in the cloud to access from any location with secure backup
- set up plugin marketplace for viewsm datasources, domains - free/paid plugins
- setup github sponsor account, paypal, patreon, etc


## Marketing

- make landing page to gather emails for mailing list
- post to twitter, medium, reddit, neo4j community for feedback
- launch on product hunt, hacker news, reddit
- have limited invites so can scale up slowly
