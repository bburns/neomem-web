// facet definitions

import * as cypher from './cypher'

const projectCols = "name,timeframe,notes,place"


export default {

  all: {
    cols: "name,project,notes,timeframe,place,order",
    group: "type",
    query: cypher.facets.all.query,
    addQuery: cypher.facets.all.addQuery,
  },

  projects: {
    cols: "id,type,name,notes,timeframe,client",
    group: "type",
    query: cypher.facets.projects.query,
    addQuery: cypher.facets.projects.addQuery,
  },

  personal: {
    params: { projectName: "personal" },
    cols: projectCols,
    query: cypher.facets.personal.query,
    addQuery: cypher.facets.personal.addQuery,
  },

  neomem: {
    params: { projectName: "neomem" },
    // group: "relntype",
    cols: projectCols,
    query: cypher.facets.neomem.query,
    addQuery: cypher.facets.neomem.addQuery,
  },

  tallieo: { 
    params: { projectName: 'tallieo' }, 
    cols: projectCols, 
    query: cypher.facets.tallieo.query,
    addQuery: cypher.facets.tallieo.addQuery,
  },

  // people: {
  //   cols: genericCols,
  //   params: { label: 'Person' },
  // },

  // books: {
  //   cols: "id,type,author,name,notes",
  // },

  timeframe: {
    cols: "name,type,project,notes",
    group: "timeframe",
    query: cypher.facets.timeframe.query,
    addQuery: cypher.facets.timeframe.addQuery,
  },

  story: {
    cols: "id,name,type,notes,order,relntype,parentId",
    // group: "uhhhhh", //. how recursively group? by eg a CHILD reln?
    // cols: "id,type,name,notes,depth,order",
    params: { parentId: 48 }, // blt
    // params: { parentId: 69 }, // act one
    query: cypher.facets.story.query,
    addQuery: cypher.facets.story.addQuery,
  },
}

