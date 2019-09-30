import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {YoutubeDataService} from './main/youtube-data.service';
import {YoutubeItem} from '../models/youtube-item';
import {PageEvent} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {map, shareReplay} from 'rxjs/operators';
import {YoutubeDataFilters} from '../models/youtube-data-filters';

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
  public filtersGroup: FormGroup;
  public hidePaginator = false;
  public isEmpty$: Observable<boolean>;

  constructor(private service: YoutubeDataService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.filtersGroup = this.fb.group({
        title: '',
      }
    );
    this.displayedColumns = ['favorites', 'id', 'title', 'channelTitle'];
    this.result$ = this.service.youtubeItems$.pipe(
      shareReplay(1),
    );
    this.isEmpty$ = this.result$.pipe(
      map(res => res.length < 1),
    );
    this.totalResults$ = this.service.totalResults$;

  }

  pageEvent(event: PageEvent) {
    if (event.previousPageIndex < event.pageIndex) {
      this.service.getMoreItems();
    } else if (event.previousPageIndex > event.pageIndex) {
      this.service.getLessItems();
    }
    window.scrollTo(0, 0);
  }

  onFiltersSubmit() {
    const filters: YoutubeDataFilters = {
      videoTitle: this.filtersGroup.get('title').value
    };
    this.service.setFilters(filters);
  }

  setFavorite(item: YoutubeItem) {
    this.service.setFavorite(item);
  }

  getFavorites() {
    this.hidePaginator = true;
    this.service.getFavorites();
  }

  getAll() {
    this.hidePaginator = false;
    this.service.getAll();
  }
}
