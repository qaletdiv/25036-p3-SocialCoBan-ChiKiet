import { Router } from "express";
import { getAdminOverview } from "@/controllers/admin.controller";
import { getAdminUser, listAdminUsers, setAdminUserLock } from "@/controllers/admin-user.controller";
import {
  getAdminReport,
  handleAdminReport,
  listAdminReportHistory,
  listAdminReports,
} from "@/controllers/admin-report.controller";
import { AdminReportHistoryQueryDto, AdminReportsQueryDto } from "@/dtos/admin-reports-query.dto";
import { AdminUsersQueryDto } from "@/dtos/admin-users-query.dto";
import { HandleReportDto } from "@/dtos/handle-report.dto";
import { IdParamDto } from "@/dtos/id-param.dto";
import { SetUserLockDto } from "@/dtos/set-user-lock.dto";
import { requireAuth } from "@/middlewares/auth.middleware";
import { requireAdmin } from "@/middlewares/require-admin.middleware";
import { validateBody, validateParams, validateQuery } from "@/middlewares/validate.middleware";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/overview", getAdminOverview);
adminRouter.get("/users", validateQuery(AdminUsersQueryDto), listAdminUsers);
adminRouter.get("/users/:id", validateParams(IdParamDto), getAdminUser);
adminRouter.patch("/users/:id/lock", validateParams(IdParamDto), validateBody(SetUserLockDto), setAdminUserLock);
adminRouter.get("/reports", validateQuery(AdminReportsQueryDto), listAdminReports);
adminRouter.get("/reports/history", validateQuery(AdminReportHistoryQueryDto), listAdminReportHistory);
adminRouter.get("/reports/:id", validateParams(IdParamDto), getAdminReport);
adminRouter.post("/reports/:id/handle", validateParams(IdParamDto), validateBody(HandleReportDto), handleAdminReport);
