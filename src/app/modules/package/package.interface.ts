export interface IPackage {
  name: string;
  price: number;
  credits: number;
  perClassPrice?: number;
  features: string[];
  isMostPopular: boolean;
  discount?: number;
}