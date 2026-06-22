export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IFAQ {
  sectionTitle: string;
  sectionSubtitle: string;
  faqs: IFaqItem[];
}