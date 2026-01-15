import { Component, OnInit } from '@angular/core';
import { PageTitleService } from './core/services/page-title.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private pageTitle: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitle.init();
  }
}
