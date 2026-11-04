import { describe, it, expect } from 'vitest'
import { jsPDF } from 'jspdf'
import { BOLD_CHAR } from '../js/lib/deed-text.js'
import { MAGIC_NUMBER_3, cleanParaText, boldMarksToHtml, getTextRows } from '../js/lib/text-layout.js'

describe('cleanParaText', () => {
  it('collapses newlines and runs of spaces, and trims', () => {
    expect(cleanParaText('\n   one  two\n    three  \n')).toBe('one two three');
  });

  it('removes an empty bold block', () => {
    expect(cleanParaText('a §§ b')).toBe('a b');
  });
});

describe('boldMarksToHtml', () => {
  it('turns bold spans into <strong>', () => {
    expect(boldMarksToHtml('§BY THIS§ made by §me§.')).toBe('<strong>BY THIS</strong> made by <strong>me</strong>.');
  });

  it('leaves text without markers alone', () => {
    expect(boldMarksToHtml('plain')).toBe('plain');
  });
});

describe('getTextRows', () => {
  const makeDoc = () => {
    const doc = new jsPDF();
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    return doc;
  };

  // The expected non-whitespace characters, and which of them should be bold, derived directly from the marked-up input
  function expectedFromMarkup(markup) {
    const chars = [];
    let bold = false;
    for(const char of markup) {
      if(char === BOLD_CHAR) { bold = !bold; continue; }
      if(char !== ' ') chars.push({ char, bold });
    }
    return chars;
  }
  const printable = rows => rows.flatMap(row => Object.values(row.chars)).filter(c => c.char !== ' ');

  it('returns a single unbolded row for short plain text', () => {
    const rows = getTextRows(makeDoc(), 'Hello world', MAGIC_NUMBER_3);
    expect(rows).toHaveLength(1);
    expect(Object.values(rows[0].chars).map(c => c.char).join('')).toBe('Hello world');
    expect(Object.values(rows[0].chars).every(c => !c.bold)).toBe(true);
  });

  it('marks only the characters between bold markers as bold, and strips the markers', () => {
    const [row] = getTextRows(makeDoc(), 'one §two§ three', MAGIC_NUMBER_3);
    const chars = Object.values(row.chars);
    expect(chars.map(c => c.char).join('')).toBe('one two three');
    expect(chars.map(c => c.bold ? 'B' : '-').join('')).toBe('----BBB------');
  });

  it('wraps long text onto multiple rows', () => {
    const text = 'lorem ipsum dolor sit amet '.repeat(20).trim();
    expect(getTextRows(makeDoc(), text, MAGIC_NUMBER_3).length).toBeGreaterThan(1);
  });

  it('gives each row positive extra space per gap to justify it', () => {
    const text = 'lorem ipsum dolor sit amet '.repeat(20).trim();
    const rows = getTextRows(makeDoc(), text, MAGIC_NUMBER_3);
    for(const row of rows.slice(0, -1)) expect(row.blankSpacing).toBeGreaterThan(0);
  });

  it('keeps every character and its boldness across line wraps', () => {
    const markup = '§BY THIS DEED OF CHANGE OF NAME§ made by myself the undersigned §Testy Testalot§ of §1 High Street, Oxford, OX1 1AA§ ' +
      'formerly known as §Testy McTestface§, a British Citizen, and I §ABSOLUTELY§ and entirely renounce, relinquish and abandon the use of my said former name §Testy McTestface§';
    const rows = getTextRows(makeDoc(), markup, MAGIC_NUMBER_3);
    expect(rows.length).toBeGreaterThan(1);
    expect(printable(rows)).toEqual(expectedFromMarkup(markup));
  });

  // Regression guard for the special case where a bold marker lands exactly at a line break.
  it('keeps boldness right wherever the line breaks fall', () => {
    for(let padding = 0; padding < 60; padding++) {
      const markup = `${'x'.repeat(padding)} ` + 'word '.repeat(10) + '§bold words here§ and then more plain words follow §more bold§ to finish the paragraph off nicely';
      const rows = getTextRows(makeDoc(), markup, MAGIC_NUMBER_3);
      expect(printable(rows), `padding ${padding}`).toEqual(expectedFromMarkup(markup));
    }
  });

  it('never emits a bold marker as a printable character', () => {
    const rows = getTextRows(makeDoc(), '§a§ §b§ §c§', MAGIC_NUMBER_3);
    expect(Object.values(rows[0].chars).some(c => c.char === BOLD_CHAR)).toBe(false);
  });
});
