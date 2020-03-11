import fetch from 'fetch';

export default async function editorPluginsDbpediaQuery(term) {
  const url = new URL("http://dbpedia.org/sparql");
  const query = `
      SELECT ?description ?image WHERE {
        ?s rdfs:label "${term}"@en.
        OPTIONAL {
          ?s <http://www.w3.org/2000/01/rdf-schema#comment> ?description.
          FILTER (lang(?description) = 'en')
        }
        OPTIONAL {
          ?s <http://dbpedia.org/ontology/thumbnail> ?image.
        }
      }
    `;
  const params = {
    format: "application/sparql-results+json",
    query,
  };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  const response = await fetch(url);
  const json = await response.json();
  const sparqlResult = json.results.bindings[0];

  const foundInfo = {};
  foundInfo.description = sparqlResult.description && sparqlResult.description.value;
  foundInfo.image = sparqlResult.image && sparqlResult.image.value;
  return foundInfo;
}
