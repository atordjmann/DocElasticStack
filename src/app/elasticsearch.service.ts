import { Injectable } from '@angular/core';
import { Client } from 'elasticsearch-browser';


@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {

  private client: Client;

  private queryalldocs = {
    'query': {
      'match_all': {}
    }
  };
 
  constructor() {
    if (!this.client) {
      this.connect();
    }
  }
 
  private connect() {
    this.client = new Client({
      host: 'http://localhost:9200',
      log: 'trace'
    });
  }
 
  isAvailable(): any {
    return this.client.ping({
      requestTimeout: 1000,
      body: "C'est dispo!"
    });
  }

  addToIndex(value): any {
    return this.client.create(value);
  }

  getAllDocuments(_index, _type): any {
    return this.client.search({
      index: _index,
      type: _type,
      body: this.queryalldocs,
      filterPath: ['hits.hits._source']
    });
  }

  getAllDocumentsWithScroll(_index, _type, _size): any {
    return this.client.search({
      index: _index,
      type: _type,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'size': _size,
        'query': {
          'match_all': {}
        },
        'sort': [
          { '_uid': { 'order': 'asc' } }
        ]
      }
    });
  }
 
  getNextPage(scroll_id): any {
    return this.client.scroll({
      scrollId: scroll_id,
      scroll: '1m',
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id']
    });
  }

  fullTextSearch(_index, _type, _field, _queryText): any {
    return this.client.search({
      index: _index,
      type: _type,
      filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'query': {
          'match_phrase_prefix': {
            [_field]: _queryText,
          }
        }
      },
      '_source': ['title', 'genre', 'categorie']
    });
  }

}
