export * from './types';
export { INDUSTRIES, INDUSTRY_KEYS, industry } from './catalog/industries';
export { guessStack, savings, priceBand, PRICE_MONTHLY, paidSeats } from './stack';
export { deriveRoleViews } from './roles';
export { pickArchetype, defaultArchetype } from './archetype';
export { composePage, slugify, type ComposeOpts } from './compose';
export { imagePrompts, type ImagePrompt } from './images';
export { nextQuestions, applyAnswer, computeConfidence, adaptFromEvents, FIELD_WEIGHTS, RuleEnricher, LlmEnricher, defaultEnricher, type Enricher, type NextQuestion, type Recommendation } from './intake';
