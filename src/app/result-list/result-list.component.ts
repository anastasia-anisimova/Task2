import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {YoutubeDataService} from './main/youtube-data.service';
import {shareReplay} from 'rxjs/operators';
import {YoutubeItem} from '../models/youtube-item';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ResultListComponent implements OnInit {
  public result$: Observable<YoutubeItem[]>;
  public displayedColumns: string[];

  constructor(private service: YoutubeDataService) {
  }

  ngOnInit() {
    this.displayedColumns = ['number', 'id', 'title', 'description'];
    this.result$ = this.service.youtubeItems$;
  }

  onAddItems() {
    this.service.getMoreItems();
  }

  onRemoveItems() {
    this.service.getLessItem();
  }


}
