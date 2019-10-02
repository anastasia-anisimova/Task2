import {Injectable} from '@angular/core';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';

@Injectable()
export class YoutubeDataService {

  public youtubeItems$: Observable<YoutubeItem[]>;
  public totalResults$: Observable<number>;
  private favoritesSubj: BehaviorSubject<YoutubeItem[]> = new BehaviorSubject(null);
  private tokenChangeSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private filtersSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private nextToken = '';
  private prevToken = '';
  private readonly apiKey: string = 'AIzaSyA5leN1_mVGySnLd_5eMVv8jHerQbZAWts';
  private readonly BASE_URL: string = 'https://www.googleapis.com/youtube/v3/';

  private readonly TOP_ANIMAL_VIDEO_URL =
    `${this.BASE_URL}search?part=snippet&order=rating&maxResults=50&type=video&videoCategoryId=15&key=${this.apiKey}`;

  public static setFavorite(item: YoutubeItem) {
    item.isFavorite = !item.isFavorite;
    if (localStorage.getItem(item.id)) {
      localStorage.removeItem(item.id);
    } else {
      localStorage.setItem(item.id, JSON.stringify(item));
    }
  }

  private static findEntry(value: string, findValue: string): boolean {
    return findValue ? value.toLowerCase().indexOf(findValue.toLowerCase()) > -1 : true;
  }

  private static checkIsFavorite(item: YoutubeItem): boolean {
    return localStorage.getItem(item.id) !== null;
  }

  private createUrl(token: string, filter: string): string {
    let url = this.TOP_ANIMAL_VIDEO_URL;
    if (token) {
      url += `&pageToken=${token}`;
    }
    if (filter) {
      url += `&q=${filter}`;
    }
    return url;
  }

  constructor(public http: HttpClient) {

    const data$ = combineLatest([this.tokenChangeSubj, this.filtersSubj]).pipe(
      switchMap(([token, filter]) => this.http.get(this.createUrl(token, filter))),
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

    this.youtubeItems$ = combineLatest([data$, this.favoritesSubj, this.filtersSubj]).pipe(
      map(([data, favorites, filter]) => favorites ? this.filterData(favorites, filter) : this.prepareDate(data.items)),
      shareReplay(1),
    );
  }

  getMoreItems() {
    this.tokenChangeSubj.next(this.nextToken);
  }

  getLessItems() {
    this.tokenChangeSubj.next(this.prevToken);
  }

  setFilters(filter: string) {
    this.filtersSubj.next(filter);
  }

  getFavorites() {
    const items: YoutubeItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      items.push(JSON.parse(localStorage.getItem(key)));
    }
    this.favoritesSubj.next(items);
  }

  getAll() {
    this.favoritesSubj.next(null);
    this.tokenChangeSubj.next('');
  }

  private prepareDate(items: any): YoutubeItem[] {
    return YoutubeItem.convertFromArray(items)
      .map(item => {
        item.isFavorite = YoutubeDataService.checkIsFavorite(item);
        return item;
      });

  }

  private filterData(arr: YoutubeItem[], filter: string) {
    return arr.filter(val => YoutubeDataService.findEntry(val.title, filter));
  }
}
