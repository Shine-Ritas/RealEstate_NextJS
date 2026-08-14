import type { components, operations } from "./generated/schema";

export type ApiSchema<Name extends keyof components["schemas"]> = components["schemas"][Name];
export type OperationName = keyof operations;

export type OperationQuery<Name extends OperationName> = operations[Name]["parameters"] extends {
  query?: infer Query;
}
  ? NonNullable<Query>
  : never;

export type JsonRequest<Name extends OperationName> = operations[Name] extends {
  requestBody: { content: { "application/json": infer Body } };
}
  ? Body
  : never;

export type MultipartRequest<Name extends OperationName> = operations[Name] extends {
  requestBody: { content: { "multipart/form-data": infer Body } };
}
  ? Body
  : never;

type OperationResponses<Name extends OperationName> = operations[Name]["responses"];

export type JsonResponse<
  Name extends OperationName,
  Status extends keyof OperationResponses<Name>,
> = OperationResponses<Name>[Status] extends {
  content: { "application/json": infer Response };
}
  ? Response
  : never;
