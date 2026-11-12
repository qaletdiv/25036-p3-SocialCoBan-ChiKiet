import type { RequestHandler } from "express";
import { adminService } from "@/services/admin.service";

export const getAdminOverview: RequestHandler = async (_req, res) => {
  const overview = await adminService.getOverview();
  res.json({ success: true, data: overview });
};
