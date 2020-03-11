import { get } from '@ember/object';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency-decorators';

const COMPONENT_ID = 'editor-plugins/dbpedia-info-card';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-dbpedia-info-plugin
 * @class RdfaEditorDbpediaFetcherPlugin
 * @constructor
 * @extends EmberService
 */
export default class RdfaEditorDbpediaPluginService extends Service {

  /**
   * task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
  @task
  // eslint-disable-next-line require-yield
  *execute(hrId, rdfaBlocks, hintsRegistry, _editor){
    const hints = [];

    for( const rdfaBlock of rdfaBlocks ) {
      // using the removal here requires us to add hints in a separate loop.
      hintsRegistry.removeHintsInRegion(rdfaBlock.region, hrId, COMPONENT_ID);

      if (this.isWikipediaLink( rdfaBlock )) {
        const newHint = this.generateHintCard( rdfaBlock );
        hints.pushObject( newHint );
      }
    }

    // adding hints must occur in a separate loop from removing hints
    hintsRegistry.addHints(hrId, COMPONENT_ID, hints);
  }

  /**
   * Given context object, detects if it is a reference to a wikipedia article
   *
   * @method isWikipediaLink
   *
   * @param {Object} rdfaBlock Context instance with an array of embedded contexts.
   * @return {boolean} Truethy if the deepest nested object is a semantic wikipedia link.
   *
   * @private
   */
  isWikipediaLink(rdfaBlock) {
    return (get( rdfaBlock, "context.lastObject.object" ) || "")
      .startsWith("https://en.wikipedia.org/wiki/");
  }

  /**
   * Generates a card given a hint
   *
   * @method generateHintCard
   *
   * @param {Object} rdfaBlock containing the hinted string and the location of this string
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateHintCard(rdfaBlock){
    const term = decodeURIComponent(rdfaBlock.context.lastObject.object.split('/').pop());

    return EmberObject.create({
      info: { term },
      card: COMPONENT_ID,
      location: [rdfaBlock.start, rdfaBlock.end],
      options: { noHighlight: true },
    });
  }
}
