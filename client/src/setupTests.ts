import '@testing-library/jest-dom';
global.TextEncoder = require("util").TextEncoder;

const suppressedWarnings = [
  "An update to",
  "not wrapped in act"
];

const originalError = console.error;
console.error = (...args) => {
  if (suppressedWarnings.some(w => args[0]?.includes(w))) return;
  originalError(...args);
};