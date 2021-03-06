import { getOwner } from '@ember/application';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-dbpedia-info-plugin
 * @class RdfaEditorDbpediaFetcherPlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorDbpediaFetcherPlugin = Service.extend({

  init() {
    this._super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
  },

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
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    //We check if we have new contexts 
    if (contexts.length === 0) return [];

    const hints = [];

    contexts.forEach((context) => {
      //For each of the context we detect if it's relevant to our plugin
      let relevantContext = this.detectRelevantContext(context);
      if (relevantContext) {
        // If the context is relevant we remove other hints associated to that context
        hintsRegistry.removeHintsInRegion(context.region, hrId, this.get('who'));
        // And generate a new hint
        hints.pushObjects(this.generateHintsForContext(context));
      }
    });
    // For each of the hints we generate a new card
    const cards = hints.map( (hint) => this.generateCard(hrId, hintsRegistry, editor, hint));
    if(cards.length > 0) {
      // We add the new cards to the hint registry
      hintsRegistry.addHints(hrId, this.get('who'), cards);
    }
    yield 1;
  }),

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
    return context.semanticNode.rdfaAttributes && context.semanticNode.rdfaAttributes._property == 'rdf:seeAlso';
  },



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
  },

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hrId, hintsRegistry, editor, hint){
    return EmberObject.create({
      info: {
        label: this.get('who'),
        term: hint.term,
        htmlString: '<b>hello world</b>',
        location: hint.location,
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      card: this.get('who')
    });
  },

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
    const term = decodeURI(context.semanticNode.rdfaAttributes._href.split('/').pop());
    hints.push({term, location});
    return hints;
  }
});

RdfaEditorDbpediaFetcherPlugin.reopen({
  who: 'editor-plugins/dbpedia-info-card'
});
export default RdfaEditorDbpediaFetcherPlugin;
