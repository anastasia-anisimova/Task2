import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {ResultListComponent} from './result-list/result-list.component';
import {HttpClientModule} from '@angular/common/http';
import {YoutubeDataService} from './result-list/main/youtube-data.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatPaginatorModule, MatTableModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent,
    ResultListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
  ],
  providers: [YoutubeDataService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
