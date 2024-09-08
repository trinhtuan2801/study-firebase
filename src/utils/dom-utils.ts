export const focusVisible = (element: HTMLElement) => {
  element.contentEditable = 'true';
  element.focus();
  element.contentEditable = 'false';
};
