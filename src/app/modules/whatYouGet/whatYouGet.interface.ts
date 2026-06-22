export interface IOffering {
  icon: string;
  title: string;
  description: string;
}

export interface IWhatYouGet {
  sectionTitle: string;
  sectionSubtitle: string;
  offerings: IOffering[];
}
