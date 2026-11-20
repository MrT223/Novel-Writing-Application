// ========================================================================
// File Operations — Novel Writing Application
// ========================================================================

import { saveAs } from 'file-saver';
import type { Chapter, ExportFormat, Project } from '@/types';

// ---- Export Project ----
export function exportProject(project: Project, format: ExportFormat): void {
  switch (format) {
    case 'json':
      exportAsJson(project);
      break;
    case 'markdown':
      exportAsMarkdown(project);
      break;
    case 'txt':
      exportAsText(project);
      break;
    case 'html':
      exportAsHtml(project);
      break;
  }
}

// ---- Import Project ----
export async function importProject(file: File): Promise<Project> {
  const text = await file.text();

  try {
    const data = JSON.parse(text) as Project;

    // Basic validation
    if (!data.id || !data.title || !Array.isArray(data.chapters)) {
      throw new Error('Invalid project file: missing required fields');
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

// ---- Export Chapter ----
export function exportChapter(chapter: Chapter, format: ExportFormat): void {
  const filename = sanitizeFilename(chapter.title);

  switch (format) {
    case 'json': {
      const blob = new Blob([JSON.stringify(chapter, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      saveAs(blob, `${filename}.json`);
      break;
    }
    case 'markdown': {
      const md = chapterToMarkdown(chapter);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      saveAs(blob, `${filename}.md`);
      break;
    }
    case 'txt': {
      const txt = chapterToPlainText(chapter);
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${filename}.txt`);
      break;
    }
    case 'html': {
      const html = chapterToHtml(chapter);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      saveAs(blob, `${filename}.html`);
      break;
    }
  }
}

// ---- Format Converters ----

function exportAsJson(project: Project): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  saveAs(blob, `${sanitizeFilename(project.title)}.json`);
}

function exportAsMarkdown(project: Project): void {
  const lines: string[] = [];

  lines.push(`# ${project.title}`);
  lines.push('');
  lines.push(`**Author:** ${project.author}`);
  lines.push('');

  if (project.synopsis) {
    lines.push(`> ${project.synopsis}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');

  for (const chapter of project.chapters) {
    lines.push(chapterToMarkdown(chapter));
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], {
    type: 'text/markdown;charset=utf-8',
  });
  saveAs(blob, `${sanitizeFilename(project.title)}.md`);
}

function exportAsText(project: Project): void {
  const lines: string[] = [];

  lines.push(project.title.toUpperCase());
  lines.push(`by ${project.author}`);
  lines.push('');

  if (project.synopsis) {
    lines.push(project.synopsis);
    lines.push('');
  }

  lines.push('='.repeat(60));
  lines.push('');

  for (const chapter of project.chapters) {
    lines.push(chapterToPlainText(chapter));
    lines.push('');
  }

  const blob = new Blob([lines.join('\n')], {
    type: 'text/plain;charset=utf-8',
  });
  saveAs(blob, `${sanitizeFilename(project.title)}.txt`);
}

function exportAsHtml(project: Project): void {
  const chaptersHtml = project.chapters
    .map((ch) => chapterToHtml(ch))
    .join('\n<hr>\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)}</title>
  <style>
    body {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1rem;
      font-family: 'Source Serif 4', 'Georgia', serif;
      font-size: 17px;
      line-height: 1.75;
      color: #0F172A;
      background: #FFFBEB;
    }
    h1 { font-size: 2rem; margin-bottom: 0.25em; }
    h2 { font-size: 1.5rem; margin-top: 2em; }
    h3 { font-size: 1.25rem; margin-top: 1.5em; }
    .author { color: #475569; margin-bottom: 1em; }
    .synopsis { font-style: italic; color: #475569; margin-bottom: 2em; }
    hr { border: none; border-top: 1px solid #E5E2D9; margin: 2em 0; }
    p { margin-bottom: 0.75em; }
  </style>
</head>
<body>
  <h1>${escapeHtml(project.title)}</h1>
  <p class="author">by ${escapeHtml(project.author)}</p>
  ${project.synopsis ? `<p class="synopsis">${escapeHtml(project.synopsis)}</p>` : ''}
  <hr>
  ${chaptersHtml}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${sanitizeFilename(project.title)}.html`);
}

// ---- Chapter Converters ----

function chapterToMarkdown(chapter: Chapter): string {
  const lines: string[] = [];
  lines.push(`## ${chapter.title}`);
  lines.push('');

  if (chapter.synopsis) {
    lines.push(`*${chapter.synopsis}*`);
    lines.push('');
  }

  for (const scene of chapter.scenes) {
    if (scene.title) {
      lines.push(`### ${scene.title}`);
      lines.push('');
    }
    lines.push(stripHtmlContent(scene.content));
    lines.push('');
  }

  return lines.join('\n');
}

function chapterToPlainText(chapter: Chapter): string {
  const lines: string[] = [];
  lines.push(chapter.title.toUpperCase());
  lines.push('-'.repeat(40));
  lines.push('');

  for (const scene of chapter.scenes) {
    if (scene.title) {
      lines.push(`[${scene.title}]`);
      lines.push('');
    }
    lines.push(stripHtmlContent(scene.content));
    lines.push('');
    lines.push('* * *');
    lines.push('');
  }

  return lines.join('\n');
}

function chapterToHtml(chapter: Chapter): string {
  const scenesHtml = chapter.scenes
    .map((scene) => {
      const titleHtml = scene.title ? `<h3>${escapeHtml(scene.title)}</h3>` : '';
      // If content is already HTML (from TipTap), use directly; otherwise wrap in <p>
      const contentHtml = scene.content.startsWith('<')
        ? scene.content
        : `<p>${escapeHtml(scene.content)}</p>`;
      return `${titleHtml}\n${contentHtml}`;
    })
    .join('\n');

  return `<h2>${escapeHtml(chapter.title)}</h2>\n${scenesHtml}`;
}

// ---- Utilities ----

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100) || 'untitled';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtmlContent(content: string): string {
  // Simple HTML tag stripping for plain text export
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
