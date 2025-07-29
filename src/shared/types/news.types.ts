export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content?: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  views: string;
  category: string;
  isFeatured?: boolean;
}
