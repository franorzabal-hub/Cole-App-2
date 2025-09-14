#!/bin/bash

# Create directories
mkdir -p src/screens/auth
mkdir -p src/screens/events
mkdir -p src/screens/messages
mkdir -p src/screens/news
mkdir -p src/screens/permissions
mkdir -p src/screens/profile
mkdir -p src/screens/reports
mkdir -p src/screens/settings
mkdir -p src/assets

# Create stub screens
cat > src/screens/auth/RegisterScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text>Register Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/auth/ForgotPasswordScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ForgotPasswordScreen() {
  return (
    <View style={styles.container}>
      <Text>Forgot Password Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/events/EventsScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Text>Events Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/events/EventDetailScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EventDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>Event Detail Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/messages/MessagesScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text>Messages Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/messages/ChatScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text>Chat Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/news/NewsDetailScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewsDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>News Detail Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/permissions/ExitPermissionsScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExitPermissionsScreen() {
  return (
    <View style={styles.container}>
      <Text>Exit Permissions Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/permissions/CreateExitPermissionScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CreateExitPermissionScreen() {
  return (
    <View style={styles.container}>
      <Text>Create Exit Permission Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/reports/ReportsScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text>Reports Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/profile/ProfileScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

cat > src/screens/settings/SettingsScreen.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
EOF

# Create placeholder logo
echo "Creating placeholder logo..."
touch src/assets/logo.png

echo "All stub files created successfully!"
echo "Run 'npm install' and then 'npm run ios' to start the app"