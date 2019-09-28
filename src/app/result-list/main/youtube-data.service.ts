import {Injectable} from '@angular/core';
import {map, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {YoutubeItem} from '../../models/youtube-item';
import {Observable} from 'rxjs';

@Injectable()
export class YoutubeDataService {

  private readonly apiKey: string = 'AIzaSyAJZMeQPTxh4te83NJt9l5FTQjQ4-wNhfE';
  private readonly YOUTUBE_URL: string = 'https://www.googleapis.com/youtube/v3/';
  private maxResult = 5;

  constructor(public http: HttpClient) {
  }

  getVideosData(maxResult = this.maxResult): Observable<YoutubeItem[]> {
    const url = `${this.YOUTUBE_URL}videos?part=snippet&chart=mostPopular&maxResults=${maxResult}&videoCategoryId=15&key=${this.apiKey}`;
    return this.http.get(url)
      .pipe(
        map((val: any) => YoutubeItem.convertFromArray(val.items)),  // типизировать youtube data
      );
  }


}
