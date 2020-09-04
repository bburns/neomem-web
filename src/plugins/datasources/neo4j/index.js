// neomem neo4j datasource

//. use this to evolve a universalish data api



import neo4j from 'neo4j-driver'


const uri = process.env.REACT_APP_NEO4J_URI
const user = process.env.REACT_APP_NEO4J_USER
const password = process.env.REACT_APP_NEO4J_PASSWORD

// get driver
// note: neo4j stores 64-bit ints, js only goes up to 53-bits (9e16)
// see https://github.com/neo4j/neo4j-javascript-driver#enabling-native-numbers
const driver = neo4j.driver(uri, 
  neo4j.auth.basic(user, password), 
  { disableLosslessIntegers: true },
)


// get neo4j session - be sure to call session.close() when done
export function getSession({ readOnly=false }={}) {
  if (readOnly) {
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })
    return session
  }
  const session = driver.session()
  return session
}


export async function run(query, params) {
  console.log('run', query, params)
  try {
    const session = getSession()
    const result = await session.run(query, params)
    session.close()  
    console.log('result', result)
    return result
  } catch(error) {
    console.error(error)
    session.close()  
  }
}

// for queries that return `true as ok`
function getOk(result) {
  const record = result.records && result.records[0]
  const ok = record && record.get('ok')
  return ok
}


// # Show vertex types in Cypher method 1
// MATCH (n) 
// RETURN DISTINCT labels(n)
// # Show vertex types in Cypher method 2
// CALL db.labels();
async function getTypes() {
  const query = "call db.labels()"
  // const session = driver.session()
  // const result = await session.run(query)
  // session.close()
  const result = await run(query)
  const types = result.records.map(record => record.get('label')).sort()
  return types
}



export async function deleteItem(id) {
  const query = `
  MATCH (n)
  WHERE id(n)=$id
  DETACH DELETE n
  // RETURN count(n)
  RETURN true as ok
  `
  const params = { id }
  const result = await run(query, params)
  // const record = result.records && result.records[0]
  // const count = record && record.get('count(n)')
  // return count===1
  return getOk(result)
}


// add a generic item and add link to inbox
//. merge with 
//. make link to inbox a separate call to addLink
export async function addItem() {
  const query = `
  MATCH (f:Folder {name:'inbox'})
  CREATE (n)<-[r:CHILD]-(f) 
  SET n.created=datetime(), n.modified=datetime()
  WITH n, id(n) as id
  RETURN n { .*, id }
  `
  const result = await run(query, params)
  const record = result.records[0]
  const row = record.get('n')
  return row
}


// update a string/number field value
export async function setPropertyValue(id, field, value) {
  //. can cypher do n.$field ? would be better
  const query = `
  MATCH (n)
  WHERE id(n)=$id
  SET n.${field}=$value
  SET n.modified=datetime()
  RETURN true as ok
  `
  const params = { id, value }
  const result = await run(query, params)
  return getOk(result)
}


export async function setType(id, oldvalue, value) {
  const params = { id, value, oldvalue }

  // drop existing label
  if (oldvalue) {
    const query = `
    MATCH (t)
    WHERE id(t)=$id 
    REMOVE t:${oldvalue}
    `
    const result = await run(query, params)
    if (!result) return
  }

  // add new label
  if (value) {
    const query = `
    MATCH (t)
    WHERE id(t)=$id 
    SET t:${value}
    SET t.modified=datetime()
    `
    const result = await run(query, params)
    if (!result) return
  }
  return true
}


//. merge with setRelation2
export async function setRelation(id, field, oldvalue, value) {

  const type = field[0].toUpperCase() + field.slice(1)
  const relntype = field.toUpperCase()

  const params = { id, value, oldvalue }

  // drop any existing relation
  if (oldvalue) {
    const query = `
    MATCH (n)-[r:${relntype}]->(m:${type} {name: $oldvalue})
    WHERE id(n)=$id 
    DELETE r
    `
    const result = await run(query, params)
    if (!result) return
  }

  // add new relation
  if (value) {
    const query = `
    MATCH (n), (m:${type} {name: $value}) 
    WHERE id(n)=$id 
    CREATE (n)-[:${relntype}]->(m)
    SET n.modified=datetime()
    `
    const result = await run(query, params)
    if (!result) return
  }

  return true
}


//. merge with setRelation
//. multiselect? single select for now?
// eg field='project', oldvalue='', value='neomem', destType='View'
export async function setRelation2(id, field, oldvalue, value, destType) {

  const srcType = field[0].toUpperCase() + field.slice(1) // eg 'Project'
  // const relntype = field.toUpperCase()

  // item must have a type to set this type of relationship
  if (!destType) {
    return false
  }
  // what is relntype? it depends on the type of thing being linked to
  // eg if data.type==='View' then relntype is VIEW
  //. are there exceptions?
  const RELNTYPE = destType.toUpperCase() // eg 'View' to 'VIEW'

  const params = { id, oldvalue, value }
  console.log(params)

  const session = getSession()

  // drop any existing relation
  if (oldvalue) {
    const query = `
    MATCH (n)<-[r]-(m:${srcType} {name:$oldvalue})
    WHERE id(n)=$id 
    DELETE r
    `
    console.log(query)
    const result = await session.run(query, params)
    console.log(result)
  }

  // add link to item
  if (value) {
    const query = `
    MATCH (n), (m:${srcType} {name:$value})
    WHERE id(n)=$id
    CREATE (n)<-[r:${RELNTYPE}]-(m)
    SET n.modified=datetime()
    `
    console.log(query)
    const result = await session.run(query, params)
    console.log(result)
  }

  session.close()
  return true
}
