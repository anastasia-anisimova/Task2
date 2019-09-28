import { TestBed } from '@angular/core/testing';

import { YoutubeDataService } from './youtube-data.service';

describe('YoutubeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YoutubeDataService = TestBed.get(YoutubeDataService);
    expect(service).toBeTruthy();
  });
});
