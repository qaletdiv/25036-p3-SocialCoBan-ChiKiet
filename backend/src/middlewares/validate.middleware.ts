import type { RequestHandler } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AppError } from "@/utils/app-error";

type DtoClass<T extends object> = new () => T;
type RequestSource = "body" | "query" | "params";

const createValidator =
  <T extends object>(source: RequestSource, dtoClass: DtoClass<T>): RequestHandler =>
  async (req, res, next) => {
    const dto = plainToInstance(dtoClass, req[source] ?? {});
    const errors = await validate(dto, { whitelist: true });

    if (errors.length > 0) {
      const details = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints ?? {}),
      }));
      next(AppError.validation(details));
      return;
    }

    // Express 5 exposes query and params as read-only getters
    if (source === "body") req.body = dto;
    else res.locals[source] = dto;
    next();
  };

export const validateBody = <T extends object>(dtoClass: DtoClass<T>) => createValidator("body", dtoClass);
export const validateQuery = <T extends object>(dtoClass: DtoClass<T>) => createValidator("query", dtoClass);
export const validateParams = <T extends object>(dtoClass: DtoClass<T>) => createValidator("params", dtoClass);
