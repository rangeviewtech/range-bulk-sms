import { describe, it, expect, vi } from 'vitest';
import {
  findVariablesInText,
  getVariableColorIndex,
  getVariableColorTheme,
  insertVariableAtCursor,
  VARIABLE_COLOR_PALETTES,
} from '@/components/sms/variable-textarea';

describe('VariableTextarea - Tokenizer, Color Engine & Atomic Editing', () => {
  describe('findVariablesInText', () => {
    it('should accurately calculate token indices and extract keys', () => {
      const text = 'Dear {{firstName}}, order #{{orderId}} is confirmed.';
      const tokens = findVariablesInText(text);

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({
        start: 5,
        end: 18,
        key: 'firstName',
        fullMatch: '{{firstName}}',
      });
      expect(tokens[1]).toEqual({
        start: 27,
        end: 38,
        key: 'orderId',
        fullMatch: '{{orderId}}',
      });
    });

    it('should handle variables with spaces, hyphens, and underscores', () => {
      const text = 'Notice for {{ Student Name }} and {{ account_id-2 }}.';
      const tokens = findVariablesInText(text);

      expect(tokens).toHaveLength(2);
      expect(tokens[0].key).toBe('Student Name');
      expect(tokens[1].key).toBe('account_id-2');
    });

    it('should return an empty array for plain text without variables', () => {
      expect(findVariablesInText('Hello world, no variables here.')).toEqual([]);
      expect(findVariablesInText('')).toEqual([]);
    });
  });

  describe('getVariableColorTheme & getVariableColorIndex', () => {
    it('should assign expected palette colors for recognized domain variables', () => {
      // firstName -> emerald (index 0)
      expect(getVariableColorIndex('firstName')).toBe(0);
      expect(getVariableColorTheme('firstName').name).toBe('emerald');

      // orderId -> purple (index 1)
      expect(getVariableColorIndex('orderId')).toBe(1);
      expect(getVariableColorTheme('orderId').name).toBe('purple');

      // balance / amount -> amber/gold (index 2)
      expect(getVariableColorIndex('balance')).toBe(2);
      expect(getVariableColorIndex('amount')).toBe(2);
      expect(getVariableColorTheme('balance').name).toBe('amber');

      // trackingUrl -> cyan (index 3)
      expect(getVariableColorIndex('trackingUrl')).toBe(3);
      expect(getVariableColorTheme('trackingUrl').name).toBe('cyan');

      // phone -> rose (index 4)
      expect(getVariableColorIndex('phone')).toBe(4);
      expect(getVariableColorTheme('phone').name).toBe('rose');

      // date / dueDate -> blue (index 5)
      expect(getVariableColorIndex('dueDate')).toBe(5);
      expect(getVariableColorTheme('dueDate').name).toBe('blue');

      // company -> orange (index 6)
      expect(getVariableColorIndex('company')).toBe(6);
      expect(getVariableColorTheme('company').name).toBe('orange');
    });

    it('should deterministically hash unknown variable names to consistent palettes', () => {
      const index1 = getVariableColorIndex('customFieldXYZ');
      const index2 = getVariableColorIndex('customFieldXYZ');
      expect(index1).toBe(index2);
      expect(index1).toBeGreaterThanOrEqual(0);
      expect(index1).toBeLessThan(VARIABLE_COLOR_PALETTES.length);
    });

    it('should return themes with both badgeClass and textClass', () => {
      const theme = getVariableColorTheme('anything');
      expect(theme.badgeClass).toBeTruthy();
      expect(theme.textClass).toBeTruthy();
    });
  });

  describe('Atomic Variable Backspace / Delete Simulation', () => {
    // Pure function logic mirroring handleKeyDown in VariableTextarea
    function simulateBackspace(
      currentText: string,
      cursorStart: number,
      cursorEnd: number
    ): { nextText: string; newCursor: number; prevented: boolean } {
      const variables = findVariablesInText(currentText);

      if (cursorStart === cursorEnd) {
        const cursor = cursorStart;
        // 1. Immediately after variable: "Hello {{name}}|"
        const varImmediatelyBefore = variables.find((v) => v.end === cursor);
        if (varImmediatelyBefore) {
          const nextText =
            currentText.slice(0, varImmediatelyBefore.start) +
            currentText.slice(varImmediatelyBefore.end);
          return { nextText, newCursor: varImmediatelyBefore.start, prevented: true };
        }

        // 2. Inside variable: "Hello {{na|me}}"
        const varInside = variables.find((v) => cursor > v.start && cursor < v.end);
        if (varInside) {
          const nextText =
            currentText.slice(0, varInside.start) + currentText.slice(varInside.end);
          return { nextText, newCursor: varInside.start, prevented: true };
        }
      } else {
        // Range selection snap
        let start = cursorStart;
        let end = cursorEnd;

        const varAtStart = variables.find((v) => start > v.start && start < v.end);
        if (varAtStart) start = varAtStart.start;

        const varAtEnd = variables.find((v) => end > v.start && end < v.end);
        if (varAtEnd) end = varAtEnd.end;

        if (start !== cursorStart || end !== cursorEnd) {
          const nextText = currentText.slice(0, start) + currentText.slice(end);
          return { nextText, newCursor: start, prevented: true };
        }
      }

      // Default backspace: delete single character before cursor
      const nextText =
        currentText.slice(0, Math.max(0, cursorStart - 1)) + currentText.slice(cursorEnd);
      return { nextText, newCursor: Math.max(0, cursorStart - 1), prevented: false };
    }

    function simulateDelete(
      currentText: string,
      cursorStart: number,
      cursorEnd: number
    ): { nextText: string; newCursor: number; prevented: boolean } {
      const variables = findVariablesInText(currentText);

      if (cursorStart === cursorEnd) {
        const cursor = cursorStart;
        // 1. Immediately before variable: "|{{name}}"
        const varImmediatelyAfter = variables.find((v) => v.start === cursor);
        if (varImmediatelyAfter) {
          const nextText =
            currentText.slice(0, varImmediatelyAfter.start) +
            currentText.slice(varImmediatelyAfter.end);
          return { nextText, newCursor: varImmediatelyAfter.start, prevented: true };
        }

        // 2. Inside variable: "{{na|me}}"
        const varInside = variables.find((v) => cursor > v.start && cursor < v.end);
        if (varInside) {
          const nextText =
            currentText.slice(0, varInside.start) + currentText.slice(varInside.end);
          return { nextText, newCursor: varInside.start, prevented: true };
        }
      }

      // Default delete
      const nextText = currentText.slice(0, cursorStart) + currentText.slice(cursorEnd + 1);
      return { nextText, newCursor: cursorStart, prevented: false };
    }

    it('should delete the entire variable when Backspace is pressed right after the variable tag', () => {
      const text = 'Hello {{firstName}}!';
      // 'Hello {{firstName}}' ends at index 19. Cursor right after variable is at index 19.
      const tokens = findVariablesInText(text);
      expect(tokens[0].end).toBe(19);

      const result = simulateBackspace(text, 19, 19);
      expect(result.prevented).toBe(true);
      expect(result.nextText).toBe('Hello !');
      expect(result.newCursor).toBe(6); // Right after 'Hello '
    });

    it('should delete the entire variable when Backspace is pressed inside the variable tag', () => {
      const text = 'Hello {{firstName}}!';
      // Cursor inside '{{first|Name}}' at index 13
      const result = simulateBackspace(text, 13, 13);
      expect(result.prevented).toBe(true);
      expect(result.nextText).toBe('Hello !');
      expect(result.newCursor).toBe(6);
    });

    it('should perform normal single-character deletion when backspacing non-variable text', () => {
      const text = 'Hello {{firstName}}!';
      // Cursor after '!' at index 20
      const result = simulateBackspace(text, 20, 20);
      expect(result.prevented).toBe(false);
      expect(result.nextText).toBe('Hello {{firstName}}');
      expect(result.newCursor).toBe(19);
    });

    it('should delete the entire variable when Delete is pressed right before the variable tag', () => {
      const text = 'Hello {{firstName}}!';
      // Cursor right before '{{firstName}}' at index 6
      const result = simulateDelete(text, 6, 6);
      expect(result.prevented).toBe(true);
      expect(result.nextText).toBe('Hello !');
      expect(result.newCursor).toBe(6);
    });

    it('should delete the entire variable when Delete is pressed inside the variable tag', () => {
      const text = 'Hello {{firstName}}!';
      // Cursor inside '{{fi|rstName}}' at index 10
      const result = simulateDelete(text, 10, 10);
      expect(result.prevented).toBe(true);
      expect(result.nextText).toBe('Hello !');
      expect(result.newCursor).toBe(6);
    });

    it('should snap range selection across partial variable boundaries on Backspace', () => {
      const text = 'Hi {{name}}, your code is 123.';
      // Selection starts inside '{{na|me}}' (index 6) and ends at ',' (index 11)
      const result = simulateBackspace(text, 6, 11);
      expect(result.prevented).toBe(true);
      expect(result.nextText).toBe('Hi , your code is 123.');
      expect(result.newCursor).toBe(3); // Start of '{{name}}'
    });
  });

  describe('insertVariableAtCursor', () => {
    it('should insert variable with leading space if preceding character is not whitespace', () => {
      const mockOnChange = vi.fn();
      const mockTextarea = {
        selectionStart: 5,
        selectionEnd: 5,
        focus: vi.fn(),
        setSelectionRange: vi.fn(),
      } as unknown as HTMLTextAreaElement;

      insertVariableAtCursor(mockTextarea, 'Hello', 'firstName', mockOnChange);

      expect(mockOnChange).toHaveBeenCalledWith('Hello {{firstName}}');
    });

    it('should not add double spaces if cursor is already after a space', () => {
      const mockOnChange = vi.fn();
      const mockTextarea = {
        selectionStart: 6,
        selectionEnd: 6,
        focus: vi.fn(),
        setSelectionRange: vi.fn(),
      } as unknown as HTMLTextAreaElement;

      insertVariableAtCursor(mockTextarea, 'Hello ', 'firstName', mockOnChange);

      expect(mockOnChange).toHaveBeenCalledWith('Hello {{firstName}}');
    });

    it('should handle null textarea element gracefully', () => {
      const mockOnChange = vi.fn();
      insertVariableAtCursor(null, 'Welcome', 'balance', mockOnChange);

      expect(mockOnChange).toHaveBeenCalledWith('Welcome {{balance}}');
    });
  });
});
