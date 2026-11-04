import { describe, it, expect } from 'vitest'
import { formData, formToB64, b64ToForm, encodeState, decodeState } from '../js/lib/form-state.js'

// Minimal stand-ins for a <form> and its inputs (avoids needing a DOM)
const field = (id, props = {}) => ({ dataset: { id }, type: 'text', value: '', ...props });
const checkbox = (id, props = {}) => ({ dataset: { id }, type: 'checkbox', checked: false, ...props });
const fakeForm = (...elements) => ({
  elements,
  querySelector: selector => {
    const id = selector.match(/^\[data-id="(.*)"\]$/)[1];
    return elements.find(e => e.dataset.id === id) ?? null;
  },
});

describe('formData', () => {
  it('reads text values and checkbox states by data-id', () => {
    const form = fakeForm(field('oldName', { value: 'Testy McTestface' }), checkbox('firstNameChanged', { checked: true }));
    expect(formData(form)).toEqual({ oldName: 'Testy McTestface', firstNameChanged: true });
  });

  it('ignores elements without a data-id (e.g. the submit button)', () => {
    const form = fakeForm(field('oldName', { value: 'x' }), { dataset: {}, type: 'submit', value: '' });
    expect(formData(form)).toEqual({ oldName: 'x' });
  });

  it('ignores elements marked data-dont-save', () => {
    const form = fakeForm(field('oldName', { value: 'x' }), checkbox('skipValidation', { checked: true, dataset: { id: 'skipValidation', dontSave: 'true' } }));
    expect(formData(form)).toEqual({ oldName: 'x' });
  });
});

describe('encodeState / decodeState', () => {
  it('round-trips an object', () => {
    const obj = { oldName: 'Testy McTestface', firstNameChanged: false };
    expect(decodeState(encodeState(obj))).toEqual(obj);
  });

  // If this fails, the format of bookmarked / shared URLs has changed and existing links will break.
  it('decodes a hash in the format that existing bookmarks use', () => {
    const legacy = 'eyJvbGROYW1lIjoiVGVzdHkgTWNUZXN0ZmFjZSIsIm5ld05hbWUiOiJUZXN0eSBUZXN0YWxvdCIsImZpcnN0TmFtZUNoYW5nZWQiOmZhbHNlfQ==';
    expect(decodeState(legacy)).toEqual({ oldName: 'Testy McTestface', newName: 'Testy Testalot', firstNameChanged: false });
    expect(encodeState({ oldName: 'Testy McTestface', newName: 'Testy Testalot', firstNameChanged: false })).toBe(legacy);
  });
});

describe('b64ToForm', () => {
  it('restores text and checkbox values into the form', () => {
    const oldName = field('oldName');
    const flag = checkbox('firstNameChanged');
    const form = fakeForm(oldName, flag);
    b64ToForm(encodeState({ oldName: 'Testy McTestface', firstNameChanged: true }), form);
    expect(oldName.value).toBe('Testy McTestface');
    expect(flag.checked).toBe(true);
  });

  it('skips keys that have no matching field', () => {
    const oldName = field('oldName');
    const form = fakeForm(oldName);
    expect(() => b64ToForm(encodeState({ oldName: 'A B', gone: 'x' }), form)).not.toThrow();
    expect(oldName.value).toBe('A B');
  });

  it('round-trips with formToB64', () => {
    const source = fakeForm(field('oldName', { value: 'Testy McTestface' }), checkbox('firstNameChanged', { checked: true }));
    const target = fakeForm(field('oldName'), checkbox('firstNameChanged'));
    b64ToForm(formToB64(source), target);
    expect(formData(target)).toEqual(formData(source));
  });
});
