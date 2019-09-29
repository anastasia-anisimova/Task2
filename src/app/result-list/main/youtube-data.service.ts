import {Injectable} from '@angular/core';
import {filter, map, shareReplay, startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';

@Injectable()
export class YoutubeDataService {

  private static findEntry(value: string, findValue: string): boolean {
    return findValue ? value.toLowerCase().indexOf(findValue.toLowerCase()) > -1 : true;
  }

  public youtubeItems$: Observable<YoutubeItem[]>;
  public tokenChange: BehaviorSubject<string> = new BehaviorSubject('');
  public totalResults$: Observable<number>;

  private filtersSubj: BehaviorSubject<string> = new BehaviorSubject('');

  private nextToken: string;
  private prevToken: string;
  private readonly apiKey: string = 'AIzaSyAJZMeQPTxh4te83NJt9l5FTQjQ4-wNhfE';
  private readonly YOUTUBE_URL: string = 'https://www.googleapis.com/youtube/v3/';
  private readonly url =
    `${this.YOUTUBE_URL}videos?part=snippet&chart=mostPopular&maxResults=50&videoCategoryId=15&key=${this.apiKey}&pageToken=`;


  constructor(public http: HttpClient) {

    const data$ = this.tokenChange.asObservable().pipe(
      switchMap(token => this.http.get(this.url + token)),
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


    this.youtubeItems$ = data$.pipe(
      map((val: any) => YoutubeItem.convertFromArray(val.items)),  // типизировать youtube data
      withLatestFrom(this.filtersSubj),
      map(([data, filters]) => this.filterData(data, filters)),
      shareReplay(1),
    );
  }

  getMoreItems() {
    this.tokenChange.next(this.nextToken);
  }

  getLessItems() {
    this.tokenChange.next(this.prevToken);
  }

  setFilter(title: string) {
    this.filtersSubj.next(title);
  }

  private filterData(arr: YoutubeItem[], filters: string) {
    return arr.filter(val => YoutubeDataService.findEntry(val.title, filters));
  }

}
