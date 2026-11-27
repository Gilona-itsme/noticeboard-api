import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const bearerAuth = registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

export const jsonContent = (schema: z.ZodType) => ({
  'application/json': { schema },
});

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Noticeboard API",
      version: "1.0.0",
      description: "REST API for the application implements a bulletin board where users can publish, edit and delete their own ads",
    },
    servers: [{ url: "http://localhost:3000" }],
  });
}
