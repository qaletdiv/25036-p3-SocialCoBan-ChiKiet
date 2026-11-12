import type { RequestHandler } from "express";
import type { AdminUsersQueryDto } from "@/dtos/admin-users-query.dto";
import type { IdParamDto } from "@/dtos/id-param.dto";
import type { SetUserLockDto } from "@/dtos/set-user-lock.dto";
import { adminUserService } from "@/services/admin-user.service";

export const listAdminUsers: RequestHandler = async (_req, res) => {
  const { q, status, role, cursor } = res.locals.query as AdminUsersQueryDto;
  const page = await adminUserService.listUsers({ q, status, role, cursor });
  res.json({ success: true, data: page });
};

export const getAdminUser: RequestHandler = async (_req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const user = await adminUserService.getUser(id);
  res.json({ success: true, data: { user } });
};

export const setAdminUserLock: RequestHandler = async (req, res) => {
  const { id } = res.locals.params as IdParamDto;
  const { locked } = req.body as SetUserLockDto;
  const user = await adminUserService.setLocked(id, locked);
  res.json({ success: true, data: { user } });
};
