export interface IStep {
  title: string;
  description: string;
}

export interface IHowItWorks {
  sectionTitle: string;
  sectionSubtitle: string;
  image: string;
  badge: {
    label: string;
    tagline: string;
  };
  steps: IStep[];
}
