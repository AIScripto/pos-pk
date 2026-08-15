export interface RememberedTerminal {
  id: string;
  name: string;
  code?: string | null;
}

export interface RememberedPosSelection {
  branchId: string;
  terminal: RememberedTerminal | null;
}

export const POS_SELECTED_BRANCH_KEY = 'pos-app-selected-branch';
export const POS_SELECTED_TERMINAL_KEY = 'pos-app-selected-terminal';

export function rememberPosSelection(branchId?: string | null, terminal?: RememberedTerminal | null): void {
  if (typeof window === 'undefined') return;
  if (branchId) {
    window.localStorage.setItem(POS_SELECTED_BRANCH_KEY, branchId);
  } else {
    window.localStorage.removeItem(POS_SELECTED_BRANCH_KEY);
  }

  if (terminal?.id) {
    window.localStorage.setItem(POS_SELECTED_TERMINAL_KEY, JSON.stringify({
      id: terminal.id,
      name: terminal.name,
      code: terminal.code ?? null,
    }));
  } else {
    window.localStorage.removeItem(POS_SELECTED_TERMINAL_KEY);
  }
}

export function getRememberedPosSelection(): RememberedPosSelection {
  if (typeof window === 'undefined') return { branchId: '', terminal: null };

  try {
    const branchId = window.localStorage.getItem(POS_SELECTED_BRANCH_KEY) ?? '';
    const parsed = JSON.parse(window.localStorage.getItem(POS_SELECTED_TERMINAL_KEY) ?? 'null');
    const terminal = parsed?.id
      ? {
          id: String(parsed.id),
          name: String(parsed.name ?? ''),
          code: parsed.code ?? null,
        }
      : null;

    return { branchId, terminal };
  } catch {
    return { branchId: '', terminal: null };
  }
}

export function getRememberedTerminalLabel(): string {
  const { terminal } = getRememberedPosSelection();
  if (!terminal?.id) return '';
  if (terminal.code) return `${terminal.code} - ${terminal.name}`;
  return terminal.name || `#${terminal.id}`;
}
