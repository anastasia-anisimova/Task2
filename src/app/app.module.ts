import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ResultListComponent} from './result-list/result-list.component';
import {HttpClientModule} from '@angular/common/http';
import {YoutubeDataService} from './result-list/main/youtube-data.service';

@NgModule({
  declarations: [
    AppComponent,
    ResultListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [YoutubeDataService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
