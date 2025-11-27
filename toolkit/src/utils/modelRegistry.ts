/**
 * HUMMBL Base120 Model Registry Service
 * Centralized validation and lookup service for mental models
 */

import { validateModelCode, BASE120_MODELS, TransformationType, ModelCode } from './validateModelCode.js';

export interface ModelDefinition {
  code: ModelCode;
  name: string;
  transformation: TransformationType;
  description: string;
  example?: string;
}

// Singleton Model Registry
export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<ModelCode, ModelDefinition>;

  private constructor() {
    this.models = this.loadBase120();
  }

  static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  /**
   * Load all Base120 models into registry
   */
  private loadBase120(): Map<ModelCode, ModelDefinition> {
    const registry = new Map<ModelCode, ModelDefinition>();

    Object.entries(BASE120_MODELS).forEach(([transformation, models]) => {
      models.forEach((name, index) => {
        const code = `${transformation}${index + 1}` as ModelCode;
        registry.set(code, {
          code,
          name,
          transformation: transformation as TransformationType,
          description: this.getDefaultDescription(code),
          example: this.getDefaultExample(code)
        });
      });
    });

    return registry;
  }

  /**
   * Validate a model code
   */
  validate(code: string): ReturnType<typeof validateModelCode> {
    return validateModelCode(code);
  }

  /**
   * Get model definition by code
   */
  getModel(code: ModelCode): ModelDefinition | null {
    return this.models.get(code) || null;
  }

  /**
   * Search models by name or description
   */
  search(query: string): ModelCode[] {
    const results: ModelCode[] = [];
    const lowerQuery = query.toLowerCase();

    this.models.forEach((def, code) => {
      if (def.name.toLowerCase().includes(lowerQuery) ||
          def.description.toLowerCase().includes(lowerQuery)) {
        results.push(code);
      }
    });

    return results;
  }

  /**
   * Get all models for a transformation
   */
  getTransformationModels(transformation: TransformationType): ModelDefinition[] {
    const models: ModelDefinition[] = [];
    this.models.forEach(def => {
      if (def.transformation === transformation) {
        models.push(def);
      }
    });
    return models;
  }

  /**
   * Get all models
   */
  getAllModels(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  /**
   * Comprehensive audit of text
   */
  auditText(text: string): {
    references: Array<{code: string, definition?: ModelDefinition, isValid: boolean}>;
    hallucinations: string[];
    validationErrors: string[];
  } {
    const references = this.extractReferences(text);
    const hallucinations = this.detectHallucinations(text);
    const validationErrors = this.findValidationErrors(text);

    return { references, hallucinations, validationErrors };
  }

  /**
   * Extract model references from text
   */
  private extractReferences(text: string): Array<{code: string, definition?: ModelDefinition, isValid: boolean}> {
    const modelPattern = /(P|IN|CO|DE|RE|SY)(\d+)/g;
    const matches = [...text.matchAll(modelPattern)];

    return matches.map(([fullMatch, transformation, num]) => {
      const code = `${transformation}${num}`;
      const result = validateModelCode(code);

      return {
        code,
        definition: result.isValid ? this.models.get(code as ModelCode) : undefined,
        isValid: result.isValid
      };
    });
  }

  /**
   * Detect hallucinated mental models
   */
  private detectHallucinations(text: string): string[] {
    const forbidden = [
      'OODA Loop', 'Hanlon\'s Razor', 'Occam\'s Razor',
      'Antifragility', 'Black Swan', 'Survivorship Bias',
      'Circle of Competence', 'Map vs Territory',
      'Regression to the Mean', 'Mental Model'
    ];

    return forbidden.filter(term =>
      text.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * Find validation errors
   */
  private findValidationErrors(text: string): string[] {
    const errors: string[] = [];
    const references = this.extractReferences(text);

    references.forEach(ref => {
      if (!ref.isValid) {
        errors.push(`Invalid model code: ${ref.code}`);
      }
    });

    return errors;
  }

  /**
   * Get default description for a model (placeholder)
   */
  private getDefaultDescription(code: ModelCode): string {
    // In a full implementation, this would have detailed descriptions
    // For now, return a basic description
    const result = validateModelCode(code);
    return result.name ? `HUMMBL Base120 model: ${result.name}` : 'Unknown model';
  }

  /**
   * Get default example for a model (placeholder)
   */
  private getDefaultExample(code: ModelCode): string {
    // In a full implementation, this would have usage examples
    return `Example usage of ${code}`;
  }

  /**
   * Health check
   */
  healthCheck(): { status: 'healthy' | 'unhealthy', modelCount: number } {
    const modelCount = this.models.size;
    const expectedCount = 120; // 6 transformations × 20 models each

    return {
      status: modelCount === expectedCount ? 'healthy' : 'unhealthy',
      modelCount
    };
  }
}
