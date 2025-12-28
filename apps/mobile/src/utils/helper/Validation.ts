const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validMinLength = /.{8,}/;
const validZipCode = /^\d{5,6}$/;
const validPhoneNumber = /^[0-9]{10}$/;

const validatePassword = (password: string) => {
  const hasCapital = /[A-Z]/;
  const hasThreeSmall = /([a-z].*){1,}/;
  const hasTwoNumbers = /([0-9].*){1,}/;

  return (
    hasCapital.test(password) &&
    hasThreeSmall.test(password) &&
    hasTwoNumbers.test(password)
  );
};

const capitalizeString = (str: string) => {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()); // Capitalize the first letter of each word
};

const formatString = (str: string) => {
  if (!str) return str;

  const lowerCaseStr = str.toLowerCase(); // Convert entire string to lowercase
  return lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1); // Capitalize the first letter
};

function isValidPhoneNumber(phoneNumber: string) {
  // This regex checks that the number is 10 digits long and not all zeros.
  const regex = /^(?!0{10})\d{10}$/;
  return regex.test(phoneNumber);
}

const countUppercase = (text: string) => {
  return (text?.match(/[A-Z]/g) || []).length;
};

const createFrom = (payload: object) => {
  let formData: any = new FormData();

  (Object.keys(payload) as Array<keyof typeof payload>).forEach(key => {
    const value: any = payload[key];

    if (value && typeof value === 'object' && !(value instanceof Blob)) {
      if (value.uri && value.name && value.type) {
        formData.append(key, {
          uri: value.uri,
          name: value.name,
          type: value.type,
        });
      } else {
        formData.append(key, JSON.stringify(value));
      }
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

const decodeHTMLEntities = (text: string) => {
  return text.replace(/&lt;/g, '<');
};

const isArray = (variable: []) => Array.isArray(variable);

export {
  validateEmail,
  countUppercase,
  validMinLength,
  validZipCode,
  validPhoneNumber,
  validatePassword,
  createFrom,
  decodeHTMLEntities,
  isArray,
  isValidPhoneNumber,
  formatString,
  capitalizeString,
};
