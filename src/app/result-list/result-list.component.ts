import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {YoutubeDataService} from './main/youtube-data.service';
import {shareReplay} from 'rxjs/operators';
import {YoutubeItem} from '../models/youtube-item';
import {PageEvent} from '@angular/material';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ResultListComponent implements OnInit {
  public result$: Observable<YoutubeItem[]>;
  public displayedColumns: string[];
  public totalResults$: Observable<number>;

  constructor(private service: YoutubeDataService) {
  }

  ngOnInit() {
    this.displayedColumns = ['id', 'title', 'description'];
    this.result$ = this.service.youtubeItems$;
    this.totalResults$ = this.service.totalResults$;
  }

  pageEvent(event: PageEvent) {
    if (event.previousPageIndex < event.pageIndex) {
      this.service.getMoreItems();
    } else if (event.previousPageIndex > event.pageIndex) {
      this.service.getLessItems();
    }
  }

}
