export const articlePanelIds = ['story', 'evidence', 'counterarguments', 'current', 'sources'] as const;
export type ArticlePanelId = typeof articlePanelIds[number];
const counterTypes = new Set(['COUNTERARGUMENT', 'COUNTERARGUMENTS', 'COUNTER_EVIDENCE', 'ALTERNATIVE_EXPLANATION', 'ALTERNATIVES', 'SKEPTICAL_EXPLANATION']);
const currentTypes = new Set(['FACT_BOUNDARY', 'AFTERMATH', 'RESOLUTION_GATE', 'RESOLUTION', 'CURRENT_STATUS', 'CURRENT', 'UPDATE', 'OPEN_QUESTIONS']);
const evidenceTypes = new Set(['EVIDENCE', 'EVIDENCE_NARRATIVE', 'EVIDENCE_REVIEW', 'ANALYSIS', 'METHODS', 'SOURCE_READING']);
/** Classify existing blocks without adding or rewriting their contents. */
export function panelForBlock(block: { type: string }): ArticlePanelId {
  return counterTypes.has(block.type) ? 'counterarguments' : currentTypes.has(block.type) ? 'current' : evidenceTypes.has(block.type) ? 'evidence' : 'story';
}
