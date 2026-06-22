import { Redirect } from 'expo-router';

// This file simply fixes the "Unmatched Route" error.
// It acts as the default / route when the app boots.
// The actual protection and automatic redirect logic happens in _layout.tsx
// However, by default, we send them to the login screen.
export default function Index() {
  return <Redirect href="/auth" />;
}
