/*
Mock for expo/src/winter/runtime.native in Jest environment
Prevents the lazy-getter for __ExpoImportMetaRegistry from being set up, which causes a jest-runtime scope error when accessed during test execution
 */ 
module.exports = {};
