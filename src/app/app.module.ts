import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello.component';
import { TestEsComponent } from './test-es/test-es.component';
import { ElasticsearchService } from './elasticsearch.service';
import { AddBookComponent } from './book/add-book/add-book.component';
import { BookDetailsComponent } from './book/book-details/book-details.component';
import { ShowBooksComponent } from './book/show-books/show-books.component';
import { SearchBookComponent } from './book/search-book/search-book.component';


@NgModule({
  imports:      [ BrowserModule, FormsModule, ReactiveFormsModule, AppRoutingModule ],
  declarations: [ AppComponent, HelloComponent, TestEsComponent, AddBookComponent, BookDetailsComponent, ShowBooksComponent, SearchBookComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ElasticsearchService]
})
export class AppModule { }
