import type { RequestHandler } from "express";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { ReportPostDto } from "@/dtos/report-post.dto";
import { reportService } from "@/services/report.service";
import { requireUserId } from "@/utils/request-context";

export const reportPost: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { reason, detail } = req.body as ReportPostDto;
  const result = await reportService.reportPost(requireUserId(req), id, reason, detail);
  res.status(result.updated ? 200 : 201).json({ success: true, data: result });
};
