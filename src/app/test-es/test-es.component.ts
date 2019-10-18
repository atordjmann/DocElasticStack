import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';

@Component({
  selector: 'app-test-es',
  templateUrl: './test-es.component.html',
  styleUrls: ['./test-es.component.css']
})
export class TestEsComponent implements OnInit {

  isConnected = false;
  status: string;
  color:string;
 
  constructor(private es: ElasticsearchService, private cd: ChangeDetectorRef) {
    this.isConnected = false;
  }


  ngOnInit() {
    this.es.isAvailable().then(() => {
      this.status = 'OK';
      this.isConnected = true;
      this.color="green"
      console.log('all is ok')
    }, error => {
      this.status = 'ERROR';
      this.isConnected = false;
      this.color="red"
      console.error('Server is down', error);
    }).then(() => {
      this.cd.detectChanges();
    });
  }

}