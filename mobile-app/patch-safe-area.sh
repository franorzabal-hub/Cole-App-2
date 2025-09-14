#!/bin/bash
# Patch all problematic files
echo "// Patched for Expo compatibility
export default null;" > node_modules/react-native-safe-area-context/lib/module/specs/NativeSafeAreaProvider.js

echo "// Patched for Expo compatibility
export default null;" > node_modules/react-native-safe-area-context/lib/module/specs/NativeSafeAreaView.js

echo "// Patched for Expo compatibility
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = null;" > node_modules/react-native-safe-area-context/lib/commonjs/specs/NativeSafeAreaProvider.js

echo "// Patched for Expo compatibility
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = null;" > node_modules/react-native-safe-area-context/lib/commonjs/specs/NativeSafeAreaView.js

echo "All files patched!"
