import { Schema, model } from "mongoose";
import { IResource } from "./resource.interface";

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const ResourceModel = model<IResource>("Resource", resourceSchema);
