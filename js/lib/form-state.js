// Serialising the form to / from a URL-hash-friendly string, so deed polls can be bookmarked and shared.

// Reads the values of every element with a data-id (except those marked data-dont-save) into a plain object.
export function formData(form) {
  let obj = {};
  Array.from(form.elements).filter(e=>e.dataset.id).forEach(e=>{
    if(e.dataset.dontSave) return;
    if(e.type === 'checkbox') {
      obj[e.dataset.id] = e.checked
    } else {
      obj[e.dataset.id] = e.value;
    }
  });
  return obj;
}

export function encodeState(obj) {
  return btoa(JSON.stringify(obj));
}

export function decodeState(b64) {
  return JSON.parse(atob(b64));
}

export function formToB64(form) {
  return encodeState(formData(form));
}

// Writes a previously-saved object back into the form; keys that don't match a field are ignored.
export function b64ToForm(b64, form) {
  const obj = decodeState(b64);
  Object.entries(obj).forEach(([key, value]) => {
    const element = form.querySelector(`[data-id="${key}"]`);
    if(!element) return;
    if(element.type === 'checkbox') {
      element.checked = value;
    } else {
      element.value = value;
    }
  });
}
