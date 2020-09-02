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


export function getSession({ readOnly=false }={}) {
  if (readOnly) {
    const session = driver.session({ defaultAccessMode: neo4j.session.READ })
    return session
  }
  const session = driver.session()
  return session
}


// export default {
//   getSession,
// }

// ;(async function() {
//   const session = driver.session()
//   const query = "call db.labels()"
//   const results = await session.run(query)
//   console.log(results)
//   const foo = results.records.map(record => record.get('label')).sort()
//   console.log(foo)
//   session.close()
// })()



// # Show vertex types in Cypher method 1
// MATCH (n) 
// RETURN DISTINCT labels(n)
// # Show vertex types in Cypher method 2
// CALL db.labels();
async function getTypes() {
  const session = driver.session()
  const query = "call db.labels()"
  const results = await session.run(query)
  session.close()
  const types = results.records.map(record => record.get('label')).sort()
  return types
}


export async function updateNotes(id, notes) {
  const query = `
  MATCH (n)
  WHERE id(n)=$id
  SET n.notes=$notes
  `
  const params = { id, notes }
  console.log(query, params)
  const session = getSession()
  const result = await session.run(query, params)
  session.close()
  console.log(result)
  return true
}
