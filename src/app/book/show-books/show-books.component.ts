import { Component, OnInit } from '@angular/core';
import { BookSource } from '../book';
import { ElasticsearchService } from '../../elasticsearch.service';

@Component({
  selector: 'app-show-books',
  templateUrl: './show-books.component.html',
  styleUrls: ['./show-books.component.css']
})
export class ShowBooksComponent implements OnInit {

  private static readonly INDEX = 'book_index';
  private static readonly TYPE = 'book';
  private static readonly SIZE = 5;

  bookSources: BookSource[];
  haveNextPage = false;
  scrollID = '';
  notice = '';

  constructor(private es: ElasticsearchService) { 
    this.scrollID = '';
    this.notice = '';
    this.haveNextPage = false;
  }

  ngOnInit() {this.es.getAllDocumentsWithScroll(
      ShowBooksComponent.INDEX,
      ShowBooksComponent.TYPE,
      ShowBooksComponent.SIZE).then(
        response => {
          this.bookSources = response.hits.hits;
 
          if (response.hits.hits.length < response.hits.total) {
            this.haveNextPage = true;
            this.scrollID = response._scroll_id;
          }
          console.log(response);
        }, error => {
          console.error(error);
        }).then(() => {
          console.log('Show Book Completed!');
        });
  }
 
  showNextPage() {
    this.es.getNextPage(this.scrollID).then(
      response => {
        this.bookSources = response.hits.hits;
        if (!response.hits.hits) {
          this.haveNextPage = false;
          this.notice = 'There are no more Customers!';
        }
        console.log(response);
      }, error => {
        console.error(error);
      }).then(() => {
        console.log('Show Customer Completed!');
      });
  }

}