const { normalizeIdea } = require('../agents/curatorAgent');
const { generateDraftVariants } = require('../agents/draftAgent');
const { scoreDrafts } = require('../agents/rankingAgent');

const workflowState = new Map();

async function executeIdeaToDraftWorkflow(ideaContent, userId) {
  const runId = crypto.randomUUID();
  const workflow = {
    runId,
    ideaContent,
    userId,
    state: 'running',
    steps: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    workflow.steps.ingestIdea = { status: 'in_progress', startedAt: new Date().toISOString() };
    const idea = normalizeIdea(ideaContent, userId);
    workflow.steps.ingestIdea = { status: 'completed', ideaId: idea.id, completedAt: new Date().toISOString() };

    workflow.steps.generateDrafts = { status: 'in_progress', startedAt: new Date().toISOString() };
    const variants = await generateDraftVariants(ideaContent, userId);
    workflow.steps.generateDrafts = { status: 'completed', variantCount: variants.length, completedAt: new Date().toISOString() };

    workflow.steps.scoreDrafts = { status: 'in_progress', startedAt: new Date().toISOString() };
    const scoredVariants = await scoreDrafts(variants, userId);
    workflow.steps.scoreDrafts = { status: 'completed', completedAt: new Date().toISOString() };

    workflow.steps.policyCheck = { status: 'in_progress', startedAt: new Date().toISOString() };
    const policyResult = runPolicyCheck(scoredVariants);
    workflow.steps.policyCheck = { status: 'completed', passed: policyResult.passed, flags: policyResult.flags, completedAt: new Date().toISOString() };

    if (!policyResult.passed) {
      workflow.state = 'completed';
      workflow.steps.policyCheck.blocked = true;
      workflow.updatedAt = new Date().toISOString();
      workflowState.set(runId, workflow);
      return { runId, state: 'blocked', reason: 'Policy check failed', flags: policyResult.flags };
    }

    workflow.state = 'suspended';
    workflow.suspendedAt = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();
    workflowState.set(runId, workflow);

    return { runId, state: 'suspended', message: 'Awaiting human approval', scoredVariants };
  } catch (error) {
    workflow.state = 'failed';
    workflow.error = error.message;
    workflow.updatedAt = new Date().toISOString();
    workflowState.set(runId, workflow);
    throw error;
  }
}

function runPolicyCheck(scoredVariants) {
  const flags = [];
  let passed = true;

  for (const variant of scoredVariants) {
    const text = variant.text;

    if (text.length > 1300) {
      flags.push({ variantIndex: variant.variant_index, type: 'length', message: 'Draft exceeds 1300 characters' });
      passed = false;
    }

    const hashtagCount = (text.match(/#/g) || []).length;
    if (hashtagCount > 5) {
      flags.push({ variantIndex: variant.variant_index, type: 'hashtags', message: 'Excessive hashtags (more than 5)' });
      passed = false;
    }

    if (/^[A-Z\s,!?]+$/.test(text) && text.length > 20) {
      flags.push({ variantIndex: variant.variant_index, type: 'all_caps', message: 'Excessive ALL-CAPS detected' });
      passed = false;
    }

    const bannedPhrases = ['buy now', 'click here', 'limited time', 'act now', 'don\'t miss out'];
    for (const phrase of bannedPhrases) {
      if (text.toLowerCase().includes(phrase)) {
        flags.push({ variantIndex: variant.variant_index, type: 'banned_phrase', message: 'Contains banned phrase: "' + phrase + '"' });
        passed = false;
        break;
      }
    }
  }

  return { passed, flags };
}

function resumeWorkflow(runId, decision, editedText = null) {
  const workflow = workflowState.get(runId);

  if (!workflow) {
    return { error: 'Workflow run not found', code: 'NOT_FOUND' };
  }

  if (workflow.state !== 'suspended') {
    return { error: 'Workflow is not in suspended state', code: 'INVALID_STATE', currentState: workflow.state };
  }

  workflow.updatedAt = new Date().toISOString();

  switch (decision) {
    case 'approve':
      workflow.state = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.result = { action: 'approved', postStatus: 'scheduled' };
      break;

    case 'edit':
      if (!editedText) {
        return { error: 'Edited text required for edit decision', code: 'MISSING_EDITED_TEXT' };
      }
      workflow.state = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.result = { action: 'edited', editedText, postStatus: 'scheduled' };
      break;

    case 'regenerate':
      workflow.state = 'regenerating';
      workflow.updatedAt = new Date().toISOString();
      return { runId, state: 'regenerating', message: 'Looping back to draft generation' };

    case 'reject':
      workflow.state = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.result = { action: 'rejected', postStatus: 'discarded' };
      break;

    default:
      return { error: 'Invalid decision. Must be: approve, edit, regenerate, or reject', code: 'INVALID_DECISION' };
  }

  workflowState.set(runId, workflow);
  return { runId, state: workflow.state, result: workflow.result };
}

function getWorkflow(runId) {
  return workflowState.get(runId) || null;
}

function getAllWorkflows() {
  return Array.from(workflowState.values());
}

module.exports = { executeIdeaToDraftWorkflow, resumeWorkflow, getWorkflow, getAllWorkflows };