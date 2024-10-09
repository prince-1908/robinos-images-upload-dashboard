// src/app/SessionHeader.tsx
"use client";

import { useSession, signIn, signOut } from 'next-auth/react';

const SessionHeader = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    console.error('User is not authenticated or accessToken is missing');
  }

  return (
    <header>
      {!session || session === null ? (
        <button onClick={() => signIn('github')}>Sign in with GitHub</button>
      ) : (
        <>
          <p>Welcome, {session.user?.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </header>
  );
};

export default SessionHeader;
