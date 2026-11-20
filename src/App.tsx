import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function App() {
  // Global keyboard shortcuts (Ctrl+S, Ctrl+J, Ctrl+\, F11, MB4...)
  useKeyboardShortcuts();

  return <AppShell />;
}

