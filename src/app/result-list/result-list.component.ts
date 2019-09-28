import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {YoutubeDataService} from './main/youtube-data.service';

@Component({
  selector: 'app-result-list',
  templateUrl: './result-list.component.html',
  styleUrls: ['./result-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultListComponent implements OnInit {
  public result$: Observable<any>;

  constructor(private service: YoutubeDataService) {
  }

  ngOnInit() {
    this.result$ = this.service.getVideosData();
  }


}
