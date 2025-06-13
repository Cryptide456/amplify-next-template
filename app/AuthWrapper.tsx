// app/components/AuthWrapper.tsx
"use client";

import {
  Authenticator,
  useAuthenticator
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator.Provider>
      <AuthContent>{children}</AuthContent>
    </Authenticator.Provider>
  );
}

function AuthContent({ children }: { children: React.ReactNode }) {
  const { route } = useAuthenticator((context) => [context.route]);

  if (route === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: '100vw',
        background: 'linear-gradient(180deg, rgb(52, 167, 152), rgb(255, 255, 255))',
      }}
    >
      <Authenticator />
    </div>
  );
}

