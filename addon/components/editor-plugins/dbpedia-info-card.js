import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/dbpedia-info-card';
import fetch from 'fetch';
import dbpediaQuery from '../../utils/editor-plugins/dbpedia-query';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-dbpedia-info-plugin
* @class DbpediaFetcherCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  description: '',
  image: '',

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),

  // willRender method will get executed just before the card appears on the
  // screen, we use this method to fetch the information needed from dbpedia
  async willRender() {
    const foundInfo = await dbpediaQuery( this.info.term );
    this.setProperties( foundInfo );
  },
});
