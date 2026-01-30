if (typeof structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import '@testing-library/jest-dom'; 
import 'fake-indexeddb/auto';