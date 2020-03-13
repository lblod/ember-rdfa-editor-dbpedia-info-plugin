import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import dbpediaQuery from '../../utils/dbpedia-query';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-dbpedia-info-plugin
* @class DbpediaFetcherCard
* @extends Ember.Component
*/
export default class DbpediaInfoCardComponent extends Component {
  @tracked
  description = "";

  @tracked
  image = null;

  constructor(){
    super(...arguments);
    this.getDbpediaInfo();
  }

  // willRender method will get executed just before the card appears on the
  // screen, we use this method to fetch the information needed from dbpedia
  async getDbpediaInfo() {
    const { image, description } = await dbpediaQuery( this.args.info.term );
    this.image = image;
    this.description = description;
  }
}
