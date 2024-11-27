interface IPixabaySearchResult {
  total: number;
  hits: {
    id: string;
    thumbnail: {
      url: string;
      width: number;
      height: number;
    };
    imageURL: string;
  }[];
}

export default IPixabaySearchResult;
