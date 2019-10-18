import { Component, OnInit } from '@angular/core';
import { BookSource } from '../book';
import { ElasticsearchService } from '../../elasticsearch.service';

@Component({
  selector: 'app-search-book',
  templateUrl: './search-book.component.html',
  styleUrls: ['./search-book.component.css']
})
export class SearchBookComponent implements OnInit {
  private static readonly INDEX = 'book_index';
  private static readonly TYPE = 'book';

  bookSources: BookSource[];

  private queryText = '';
  private lastKeypress = 0;

  constructor(private es: ElasticsearchService) {
    this.queryText='';
   }

  ngOnInit() {
  }

  search($event) {
    if ($event.timeStamp - this.lastKeypress > 100) {
      this.queryText = $event.target.value;
 
      this.es.fullTextSearch(
        SearchBookComponent.INDEX,
        SearchBookComponent.TYPE,
        'title', this.queryText).then(
          response => {
            this.bookSources = response.hits.hits;
            console.log(response);
          }, error => {
            console.error(error);
          }).then(() => {
            console.log('Search Completed!');
          });
    }
 
    this.lastKeypress = $event.timeStamp;
  }

}