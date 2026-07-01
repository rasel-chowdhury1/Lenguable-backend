import { Schema, model } from "mongoose";
import { IAdminAuditLog } from "./adminAuditLog.interface";

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "add_credit",
        "remove_credit",
        "create_teacher",
        "delete_teacher",
        "manual_teacher",
        "manual_payout",
      ],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ targetId: 1 });
AdminAuditLogSchema.index({ action: 1 });

export const AdminAuditLogModel = model<IAdminAuditLog>(
  "AdminAuditLog",
  AdminAuditLogSchema,
);
