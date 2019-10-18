import { AddBookComponent } from './book/add-book/add-book.component';
import { ShowBooksComponent } from './book/show-books/show-books.component';
import { SearchBookComponent } from './book/search-book/search-book.component';
 
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 
const routes: Routes = [
    { path: '', redirectTo: 'add', pathMatch: 'full' },
    { path: 'add', component: AddBookComponent },
    { path: 'books', component: ShowBooksComponent },
    { path: 'search', component: SearchBookComponent }
];
 
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }