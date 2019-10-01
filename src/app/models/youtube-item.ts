export class YoutubeItem {

  public static convert(item: any): YoutubeItem {
    return new YoutubeItem(item.id.videoId, item.snippet.title, item.snippet.channelTitle);
  }

  public static convertFromArray(items: any[]): YoutubeItem[] { // типизировать
    return items.map(YoutubeItem.convert);
  }

  constructor(public id: string,
              public title: string,
              public channelTitle: string,
              public isFavorite = false) {
  }
}
