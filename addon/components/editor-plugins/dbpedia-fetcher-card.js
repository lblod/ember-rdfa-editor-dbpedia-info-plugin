import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/dbpedia-fetcher-card';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-dbpedia-fetcher-plugin
* @class DbpediaFetcherCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),
  description: '',
  image: '',

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  willRender() {
    const url = new URL("http://dbpedia.org/sparql")
    const query = `
      SELECT ?description ?image WHERE {
        ?s rdfs:label "${this.info.term}"@en.
        OPTIONAL {
          ?s <http://www.w3.org/2000/01/rdf-schema#comment> ?description.
          FILTER (lang(?description) = 'en')
        }
        OPTIONAL {
          ?s <http://dbpedia.org/ontology/thumbnail> ?image.
        }
      }
    `
    const params = {
      format: "application/sparql-results+json",
      query,
    }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        this.set('description', json.results.bindings[0].description.value)
        this.set('image', json.results.bindings[0].image.value)
      })
  },

  actions: {
    insert(){
      this.get('hintsRegistry').removeHintsAtLocation(this.get('location'), this.get('hrId'), 'editor-plugins/dbpedia-fetcher-card');
      const mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('editor').replaceTextWithHTML(...mappedLocation, this.get('info').htmlString);
    }
  }
});
