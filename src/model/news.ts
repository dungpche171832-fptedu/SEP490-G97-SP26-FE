export interface NewsPayload {
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  startTime: string;
  endTime: string;
}
export interface NewsItem {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
  startTime: string;
  endTime: string;
}
