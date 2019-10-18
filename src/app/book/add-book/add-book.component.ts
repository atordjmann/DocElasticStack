import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
 
import { ElasticsearchService } from '../../elasticsearch.service';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css']
})
export class AddBookComponent implements OnInit {

  form: FormGroup;

  constructor(private es: ElasticsearchService, private cd: ChangeDetectorRef) { 
    this.form = new FormGroup({
      index: new FormControl('book_index', Validators.required),
      id: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      genre: new FormControl('', Validators.required),
      categorie: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
  }

  onSubmit(value) {
    this.es.addToIndex({
      index: value.index,
      type: 'book',
      id: value.id,
      body: {
        title: value.title,
        genre: value.genre,
        categorie: value.categorie,
        published: new Date().toLocaleString()
      }
    }).then((result) => {
      console.log(result);
      alert('Document added, see log for more info');
    }, error => {
      alert('Something went wrong, see log for more info');
      console.error(error);
    });
  }

}