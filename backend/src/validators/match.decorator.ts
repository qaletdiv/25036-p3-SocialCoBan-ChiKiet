import { registerDecorator, type ValidationArguments, type ValidationOptions } from "class-validator";

export const Match =
  (siblingProperty: string, validationOptions?: ValidationOptions) =>
  (target: object, propertyName: string): void => {
    registerDecorator({
      name: "match",
      target: target.constructor,
      propertyName,
      options: { message: `${propertyName} must match ${siblingProperty}`, ...validationOptions },
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const sibling = (args.object as Record<string, unknown>)[siblingProperty];
          return typeof value === "string" && value === sibling;
        },
      },
    });
  };
