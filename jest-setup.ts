import '@testing-library/jest-native/extend-expect';

// Set API base URL before any module loads it
process.env.EXPO_PUBLIC_API_URL = 'http://test.api';

// jest-expo's setup.js calls require('expo/src/winter') which installs lazy getters for
// several globals via installGlobal(). When those getters fire during test execution the
// stored `require` is out of its module scope and jest-runtime throws "You are trying to
// import a file outside of the scope of the test code."
//
// Triggering each *setter* here (setupFilesAfterEnv, before any test runs) replaces the
// lazy getter with a static data property so subsequent accesses never call require().
// We use the built-in Node.js implementations wherever possible.
const g = global as any;

function resolveExpoWinterGlobal(name: string, value: unknown) {
  if (Object.getOwnPropertyDescriptor(g, name)?.get) {
    g[name] = value;
  }
}

resolveExpoWinterGlobal('__ExpoImportMetaRegistry', { url: null });
resolveExpoWinterGlobal('structuredClone', globalThis.structuredClone ?? ((v: unknown) => JSON.parse(JSON.stringify(v))));
resolveExpoWinterGlobal('TextDecoder', globalThis.TextDecoder);
resolveExpoWinterGlobal('TextDecoderStream', (globalThis as any).TextDecoderStream);
resolveExpoWinterGlobal('TextEncoderStream', (globalThis as any).TextEncoderStream);
resolveExpoWinterGlobal('URL', globalThis.URL);
resolveExpoWinterGlobal('URLSearchParams', globalThis.URLSearchParams);

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock')
);

// Mock react-native-safe-area-context globally
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: any) =>
      React.createElement(View, props, children),
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});
