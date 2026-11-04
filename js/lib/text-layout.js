// Justified, mixed bold/normal text layout for jsPDF. Bold spans are wrapped in BOLD_CHAR.
import { BOLD_CHAR } from './deed-text.js'

export const BODY_FONT_SIZE = 11   ; // points
export const BODY_FONT      = 'times';
export const MAGIC_NUMBER_1 = 141  ; // relates to maximum line length \
export const MAGIC_NUMBER_2 =   0.35; // relates to letter spacing       | The magic numbers are typeface-specific and
export const MAGIC_NUMBER_3 = 506  ; // relates to page width           | help with laying out justified content. Ugh.
export const MAGIC_NUMBER_4 =   0.31; // relates to line spacing        /

const BOLD_CHAR_REGEX  = new RegExp(`(${BOLD_CHAR})`, 'g');
const BOLD_BLOCK_REGEX = new RegExp(`(${BOLD_CHAR})(.*?)(${BOLD_CHAR})`, 'g');

// Collapses whitespace and drops an (first) empty bold block
export function cleanParaText(unformattedText) {
  return unformattedText.
    replace(`${BOLD_CHAR}${BOLD_CHAR}`, ''). // remove empty bold blocks
    replace(/[\n ]+/g, ' ').trim(); // remove space
}

export function boldMarksToHtml(text) {
  return text.replace(BOLD_BLOCK_REGEX, `<strong>$2</strong>`);
}

// Splits text into lines (using the supplied jsPDF doc to measure) and returns, for each line,
// its per-character bold state and the width each space needs to be to justify the line.
export function getTextRows(doc, inputValue, width) {
  const textWithoutBoldMarks = inputValue.replace(BOLD_CHAR_REGEX, '');

  let splitTextWithoutBoldMarks = doc.splitTextToSize(
    textWithoutBoldMarks,
    MAGIC_NUMBER_1
  );

  let charsMapLength = 0;
  let position = 0;
  let positionOffsetForEOLBoldToggles = 0;
  let isBold = false;

  let textRows = splitTextWithoutBoldMarks.map((row, i) => {
      const charsMap = row.split('');

      let willToggleBoldAtEndOfLine = false;
      const chars = charsMap.map((char, j) => {
        position = charsMapLength + j + i + positionOffsetForEOLBoldToggles;

        let currentChar = inputValue.charAt(position);

        if (currentChar === BOLD_CHAR) {
          isBold = !isBold;
          currentChar = inputValue.charAt(position + 1);

          // now we remove the marker, so loop jumps to the next real printable char
          let removeMarks = inputValue.split('');
          removeMarks.splice(position, 1);
          inputValue = removeMarks.join('');
        }

        // Special case: if we're at the END of a line and the next character would be a bold character, toggle bold now:
        if(j === charsMap.length - 1 && inputValue.charAt(position + 1) === BOLD_CHAR) {
          willToggleBoldAtEndOfLine = true;
          positionOffsetForEOLBoldToggles += 1;
        }

        return { char: currentChar, bold: isBold };
      });
      if(willToggleBoldAtEndOfLine) isBold = !isBold;
      charsMapLength += charsMap.length;

      // Calculate the size of the white space to justify the text
      let charsWihoutsSpacing = Object.entries(chars).filter(([key, value]) => value.char != ' ');
      let widthRow = 0;

      charsWihoutsSpacing.forEach(([key, value]) => {
        // Keep in mind that the calculations are affected if the letter is in bold or normal
        doc.setFont(BODY_FONT, value.bold ? 'bold' : 'normal');
        widthRow += doc.getStringUnitWidth(value.char) * BODY_FONT_SIZE;
      });

      let totalBlankSpaces = charsMap.length - charsWihoutsSpacing.length;
      let blankSpacing = (width - widthRow) / totalBlankSpaces;

      return {blankSpacing: blankSpacing, chars: { ...chars }};
    });

    return textRows;
}
