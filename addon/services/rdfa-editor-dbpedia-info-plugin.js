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
  *execute(hrId, contexts, hintsRegistry, _editor){
    // We check if we have new contexts
    if (contexts.length === 0) return [];

    const hints = [];

    contexts.forEach((context) => {
      //For each of the context we detect if it's relevant to our plugin
      let relevantContext = this.detectRelevantContext(context);
      if (relevantContext) {
        // If the context is relevant we remove other hints associated to that context
        hintsRegistry.removeHintsInRegion(context.region, hrId, COMPONENT_ID);
        // And generate a new hint
        hints.pushObjects(this.generateHintsForContext(context));
      }
    });
    // For each of the hints we generate a new card
    const cards = hints.map( (hint) => this.generateCard(hint));
    if(cards.length > 0) {
      // We add the new cards to the hint registry
      hintsRegistry.addHints(hrId, COMPONENT_ID, cards);
    }
  }

  /**
   * Given context object, tries to detect a context the plugin can work on
   *
   * @method detectRelevantContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {String} URI of context if found, else empty string.
   *
   * @private
   */
  detectRelevantContext(context) {
    return get( context, "context.lastObject.object" )
      && context.context.lastObject.object.startsWith("https://en.wikipedia.org/wiki/");
  }

  /**
   * Maps location of substring back within reference location
   *
   * @method normalizeLocation
   *
   * @param {[int,int]} [start, end] Location withing string
   * @param {[int,int]} [start, end] reference location
   *
   * @return {[int,int]} [start, end] absolute location
   *
   * @private
   */
  normalizeLocation(location, reference) {
    return [location[0] + reference[0], location[1] + reference[0]];
  }

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hint){
    return EmberObject.create({
      info: {
        term: hint.term,
      },
      location: hint.location,
      card: COMPONENT_ID,
      options: { noHighlight: true }
    });
  }

  /**
   * Generates a hint, given a context
   *
   * @method generateHintsForContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Object} [{dateString, location}]
   *
   * @private
   */
  generateHintsForContext(context){
    const hints = [];
    const textTrimmed = context.text.replace(/\s*$/,"");
    const spacesAtTheStart = textTrimmed.length - context.text.trim().length;
    const location = [(context.start + spacesAtTheStart), (context.start + spacesAtTheStart) + textTrimmed.length];
    const term = context.context.lastObject.object.split('/').pop();
    hints.push({term, location});
    return hints;
  }
}
