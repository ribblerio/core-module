import type Anthropic from '@anthropic-ai/sdk';
import type { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function zodToAnthropicTool(
  name: string,
  description: string,
  schema: ZodSchema,
): Anthropic.Tool {
  const json = zodToJsonSchema(schema, { target: 'jsonSchema7' }) as {
    properties?: Record<string, unknown>;
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
