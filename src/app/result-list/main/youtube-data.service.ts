import {Injectable} from '@angular/core';
import {map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';

@Injectable()
export class YoutubeDataService {

  public youtubeItems$: Observable<YoutubeItem[]>;
  public totalResults$: Observable<number>;

  private tokenChangeSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private filtersSubj: BehaviorSubject<string> = new BehaviorSubject('');
  private nextToken: string;
  private prevToken: string;
  private readonly apiKey: string = 'AIzaSyAJZMeQPTxh4te83NJt9l5FTQjQ4-wNhfE';
  private readonly BASE_URL: string = 'https://www.googleapis.com/youtube/v3/';
  private readonly TOP_ANIMAL_VIDEO_URL =
    `${this.BASE_URL}videos?part=snippet&chart=mostPopular&maxResults=50&videoCategoryId=15&key=${this.apiKey}&pageToken=`;

  private static findEntry(value: string, findValue: string): boolean {
    return findValue ? value.toLowerCase().indexOf(findValue.toLowerCase()) > -1 : true;
  }

  private static filterData(arr: YoutubeItem[], filters: string) {
    return arr.filter(val => YoutubeDataService.findEntry(val.title, filters));
  }

  private static prepareDate(items: any, filters: string) {
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

  setFilters(title: string) {
    this.filtersSubj.next(title);
  }

}
