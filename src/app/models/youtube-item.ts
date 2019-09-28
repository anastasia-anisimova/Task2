export class YoutubeItem {

  public static convert(item: any): YoutubeItem {
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description
    };
  }

  public static convertFromArray(items: any[]): YoutubeItem[] { // типизировать
    return items.map(YoutubeItem.convert);
  }

  constructor(public id: string,
              public title: string,
              public description: string) {
  }
}
