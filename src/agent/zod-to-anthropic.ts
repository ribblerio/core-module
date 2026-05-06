import type { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function zodToAnthropicTool(name: string, description: string, schema: ZodSchema): {
  name: string;
  description: string;
  input_schema: object;
} {
  const json = zodToJsonSchema(schema, { target: 'jsonSchema7' }) as {
    properties?: object;
    required?: string[];
    type?: string;
  };
  return {
    name,
    description,
    input_schema: {
      type: 'object',
      properties: json.properties ?? {},
      required: json.required ?? [],
    },
  };
}
