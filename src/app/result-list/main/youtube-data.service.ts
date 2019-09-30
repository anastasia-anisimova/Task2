import {Injectable} from '@angular/core';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {YoutubeDataFilters} from '../../models/youtube-data-filters';

@Injectable()
export class YoutubeDataService {

  public youtubeItems$: Observable<YoutubeItem[]>;
  public totalResults$: Observable<number>;
  private favoritesSubj: BehaviorSubject<YoutubeItem[]> = new BehaviorSubject(null);
  private tokenChangeSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private filtersSubj: BehaviorSubject<YoutubeDataFilters> = new BehaviorSubject({});
  private nextToken: string;
  private prevToken: string;
  private readonly apiKey: string = 'AIzaSyAJZMeQPTxh4te83NJt9l5FTQjQ4-wNhfE';
  private readonly BASE_URL: string = 'https://www.googleapis.com/youtube/v3/';
  private readonly TOP_ANIMAL_VIDEO_URL =
    `${this.BASE_URL}videos?part=snippet&chart=mostPopular&maxResults=50&videoCategoryId=15&key=${this.apiKey}&pageToken=`;

  private static findEntry(value: string, findValue: string): boolean {
    return findValue ? value.toLowerCase().indexOf(findValue.toLowerCase()) > -1 : true;
  }

  private static checkIsFavorite(item: YoutubeItem): boolean {
    return localStorage.getItem(item.id) !== null;
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

    this.youtubeItems$ = combineLatest([data$, this.filtersSubj, this.favoritesSubj]).pipe(
      map(([data, filters, favorites]) => favorites ? favorites : this.prepareDate(data.items, filters)),  // типизировать youtube data
      shareReplay(1),
    );
  }

  private prepareDate(items: any, filters: YoutubeDataFilters) {
    const convertedData: YoutubeItem[] = YoutubeItem.convertFromArray(items)
      .map(item => {
        item.isFavorite = YoutubeDataService.checkIsFavorite(item);
        return item;
      });

    return this.filterData(convertedData, filters);
  }

  private filterData(arr: YoutubeItem[], filters: YoutubeDataFilters) {
    let result: YoutubeItem[] = [];
    if (filters.videoTitle !== null) {
      result = arr.filter(val => YoutubeDataService.findEntry(val.title, filters.videoTitle));
    }
    return result;
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
    item.isFavorite = !item.isFavorite;
    if (localStorage.getItem(item.id)) {
      localStorage.removeItem(item.id);
    } else {
      localStorage.setItem(item.id, JSON.stringify(item));
    }
  }

  getFavorites() {
    const items: YoutubeItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value: YoutubeItem = JSON.parse(localStorage.getItem(key));
      items.push(value);
    }
    this.favoritesSubj.next(items);
  }

  getAll() {
    this.favoritesSubj.next(null);
  }
}
