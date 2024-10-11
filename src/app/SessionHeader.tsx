// src/app/SessionHeader.tsx

"use client";

import { useSession, signIn, signOut } from "next-auth/react";

const SessionHeader = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="loader ml-[1100px]  mt-[5px] absolute"></p>;
  }

  if (!session) {
    console.error("User is not authenticated or accessToken is missing");
  }

  return (
    <header className="w-full max-w-[1250px] relative">
      {!session || session === null ? (
        <button
          onClick={() => signIn("github")}
          className="border mt-1 border-black rounded-lg px-4 py-1 absolute right-0 signup-btn md:px-6 md:py-3"
        >
          Sign in with GitHub
        </button>
      ) : (
        <>
        <div className="relative">
          <p className="text-[26px]  font-serif  absolute">Welcome, <span className="text-gray-600 font-semibold">{session.user?.name}</span></p>
          <button onClick={() => signOut()} className="text-sm absolute  md:text-base border mt-1 border-black rounded-lg px-4 py-1  right-0 signup-btn md:px-6 md:py-3">
            Sign out
          </button>
        </div>
          
        </>
      )}
    </header>
  );
};

export default SessionHeader;
