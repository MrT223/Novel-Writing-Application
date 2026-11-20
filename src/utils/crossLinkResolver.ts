// ========================================================================
// Cross-Link Resolver — Novel Writing Application
// ========================================================================

import type { CrossLinkEntry, TabType } from '@/types';

// ---- Types ----
export interface CrossLinkMatch {
  term: string;
  start: number;
  end: number;
  targetType: TabType;
  targetId: string;
  description?: string;
}

interface TrieNode {
  children: Map<string, TrieNode>;
  entries: CrossLinkEntry[];
}

export interface CrossLinkIndex {
  root: TrieNode;
  entries: CrossLinkEntry[];
}

// ---- Build Index (Trie) ----
function createTrieNode(): TrieNode {
  return { children: new Map(), entries: [] };
}

export function buildCrossLinkIndex(entries: CrossLinkEntry[]): CrossLinkIndex {
  const root = createTrieNode();

  for (const entry of entries) {
    const term = entry.term.toLowerCase();
    let node = root;

    for (const char of term) {
      if (!node.children.has(char)) {
        node.children.set(char, createTrieNode());
      }
      node = node.children.get(char)!;
    }

    node.entries.push(entry);
  }

  return { root, entries };
}

// ---- Find Matches ----
export function findMatches(text: string, index: CrossLinkIndex): CrossLinkMatch[] {
  const matches: CrossLinkMatch[] = [];
  const lowerText = text.toLowerCase();
  const textLen = lowerText.length;

  for (let i = 0; i < textLen; i++) {
    // Only match at word boundaries
    if (i > 0 && isWordChar(lowerText[i - 1])) {
      continue;
    }

    let node = index.root;
    let j = i;

    while (j < textLen && node.children.has(lowerText[j])) {
      node = node.children.get(lowerText[j])!;
      j++;

      // Check if this is a complete term AND at a word boundary
      if (node.entries.length > 0 && (j >= textLen || !isWordChar(lowerText[j]))) {
        for (const entry of node.entries) {
          matches.push({
            term: text.slice(i, j),
            start: i,
            end: j,
            targetType: entry.targetType,
            targetId: entry.targetId,
            description: entry.description,
          });
        }
      }
    }
  }

  // Remove overlapping matches — keep longest
  return deduplicateMatches(matches);
}

// ---- Resolve Link ----
export function resolveLink(
  term: string,
  entries: CrossLinkEntry[],
): { type: TabType; id: string } | null {
  const lowerTerm = term.toLowerCase();
  const entry = entries.find((e) => e.term.toLowerCase() === lowerTerm);

  if (entry) {
    return { type: entry.targetType, id: entry.targetId };
  }

  return null;
}

// ---- Helpers ----
function isWordChar(char: string): boolean {
  return /\w/.test(char);
}

function deduplicateMatches(matches: CrossLinkMatch[]): CrossLinkMatch[] {
  if (matches.length <= 1) return matches;

  // Sort by start position, then by length descending (prefer longer matches)
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start);
  });

  const result: CrossLinkMatch[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = result[result.length - 1];
    const curr = sorted[i];

    // Skip if overlapping with previous kept match
    if (curr.start < prev.end) {
      continue;
    }

    result.push(curr);
  }

  return result;
}
