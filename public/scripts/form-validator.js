function markElementValid(element) {
  element.classList.remove('invalid');
  element.classList.add('valid');
}

function markElementInvalid(element) {
  element.classList.remove('valid');
  element.classList.add('invalid');
}

function registerValidator(elementIn, elementErrorIn, validityErrors, additionalChecks) {
  const element = elementIn;
  const elementError = elementErrorIn;

  function validateHandler() {
    if (element.validity.valid) {
      elementError.textContent = '';
      markElementValid(element);
      element.removeEventListener('input', validateHandler);
      if (additionalChecks !== undefined) {
        if (additionalChecks()) {
          markElementInvalid(element);
          element.addEventListener('input', validateHandler);
          return false;
        }
      }
      return true;
    } else {
      markElementInvalid(element);
      element.addEventListener('input', validateHandler);
      for(const i in element.validity) {
        if (element.validity[i]) {
          elementError.textContent = validityErrors[i];
        }
      }
      return false;
    }
  }
  element.addEventListener('blur', validateHandler);

  return validateHandler;
}
