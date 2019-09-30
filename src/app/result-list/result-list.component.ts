import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {YoutubeDataService} from './main/youtube-data.service';
import {YoutubeItem} from '../models/youtube-item';
import {PageEvent} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {map, shareReplay} from 'rxjs/operators';

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
  public hideFavorites = false;
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
    this.service.setFilters(this.filtersGroup.get('title').value);
  }

  setFavorite(item: YoutubeItem) {
    this.service.setFavorite(item);
  }

  getFavorites() {
    this.hideFavorites = true;
    this.service.getFavorites();
  }

  getAll() {
    this.hideFavorites = false;
    this.service.getAll();
  }
}
