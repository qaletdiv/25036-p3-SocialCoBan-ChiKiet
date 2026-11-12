import type { RequestHandler } from "express";
import type { AdminReportHistoryQueryDto, AdminReportsQueryDto } from "@/dtos/admin-reports-query.dto";
import type { HandleReportDto } from "@/dtos/handle-report.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import { adminReportService } from "@/services/admin-report.service";
import { requireUserId } from "@/utils/request-context";

export const listAdminReports: RequestHandler = async (_req, res) => {
  const { status, type, reason, cursor } = res.locals.query as AdminReportsQueryDto;
  const page = await adminReportService.listReports({ status, type, reason, cursor });
  res.json({ success: true, data: page });
};

export const listAdminReportHistory: RequestHandler = async (_req, res) => {
  const { cursor } = res.locals.query as AdminReportHistoryQueryDto;
  const page = await adminReportService.listHistory(cursor);
  res.json({ success: true, data: page });
};

export const getAdminReport: RequestHandler = async (_req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const report = await adminReportService.getReport(id);
  res.json({ success: true, data: { report } });
};

export const handleAdminReport: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { action, note } = req.body as HandleReportDto;
  const report = await adminReportService.handleReport(requireUserId(req), id, action, note);
  res.json({ success: true, data: { report } });
};
