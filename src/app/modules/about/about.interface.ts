export interface IStatItem {
  value: string;
  label: string;
  description: string;
}

export interface IAbout {
  title: string;
  description: string;
  image: string;
  stats: IStatItem[];
}