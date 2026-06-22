import { Schema, model } from "mongoose";
import { IWhatYouGet, IOffering } from "./whatYouGet.interface";

const OfferingSchema = new Schema<IOffering>(
  {
    icon: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const WhatYouGetSchema = new Schema<IWhatYouGet>(
  {
    sectionTitle: { type: String, required: true, trim: true },
    sectionSubtitle: { type: String, required: true, trim: true },
    offerings: { type: [OfferingSchema], required: true },
  },
  { timestamps: true, versionKey: false },
);

const WhatYouGet = model<IWhatYouGet>("WhatYouGet", WhatYouGetSchema);
export default WhatYouGet;
