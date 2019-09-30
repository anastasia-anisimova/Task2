import {Injectable} from '@angular/core';
import {filter, map, shareReplay, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {YoutubeDataFilters} from '../../models/youtube-data-filters';

@Injectable()
export class YoutubeDataService {

  public youtubeItems$: Observable<YoutubeItem[]>;
  public totalResults$: Observable<number>;
  private tokenChangeSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private filtersSubj: BehaviorSubject<YoutubeDataFilters> = new BehaviorSubject({});
  private nextToken: string;
  private prevToken: string;
  private readonly apiKey: string = 'AIzaSyAJZMeQPTxh4te83NJt9l5FTQjQ4-wNhfE';
  private readonly BASE_URL: string = 'https://www.googleapis.com/youtube/v3/';
  private readonly TOP_ANIMAL_VIDEO_URL =
    `${this.BASE_URL}videos?part=snippet&chart=mostPopular&maxResults=23&videoCategoryId=15&key=${this.apiKey}&pageToken=`;

  private static findEntry(value: string, findValue: string): boolean {
    return findValue ? value.toLowerCase().indexOf(findValue.toLowerCase()) > -1 : true;
  }

  private static filterData(arr: YoutubeItem[], filters: YoutubeDataFilters) {
    let result: YoutubeItem[] = [];
    if (filters.videoTitle !== null) {
      result = arr.filter(val => YoutubeDataService.findEntry(val.title, filters.videoTitle));
    }
    if (filters.favorites) {
      result = arr.filter(val => localStorage.getItem(val.id) !== null);
    }
    return result;
  }

  private static prepareDate(items: any, filters: YoutubeDataFilters) {
    const convertedData = YoutubeItem.convertFromArray(items);
    return YoutubeDataService.filterData(convertedData, filters);
  }

  constructor(public http: HttpClient) {

    const data$ = this.tokenChangeSubj.asObservable().pipe(
      switchMap(token => this.http.get(this.TOP_ANIMAL_VIDEO_URL + token)),
      tap((data: any) => {
        this.nextToken = data.nextPageToken || '';
        this.prevToken = data.prevPageToken || '';
      }),
      shareReplay(1),
    );

    this.totalResults$ = data$.pipe(
      map(data => data.pageInfo.totalResults),
      shareReplay(1),
    );

    this.youtubeItems$ = combineLatest(data$, this.filtersSubj).pipe(
      map(([data, filters]) => YoutubeDataService.prepareDate(data.items, filters)),  // типизировать youtube data
      shareReplay(1),
    );
  }

  getMoreItems() {
    this.tokenChangeSubj.next(this.nextToken);
  }

  getLessItems() {
    this.tokenChangeSubj.next(this.prevToken);
  }

  setFilters(filters: YoutubeDataFilters) {
    this.filtersSubj.next(filters);
  }

  setFavorite(item: YoutubeItem) {
    localStorage.setItem(item.id, 'true');
  }

  getFavorites() {
    this.filtersSubj.next({
      favorites: true
    });
  }

  getAll() {
    this.filtersSubj.next({
      favorites: false
    });
  }
}
