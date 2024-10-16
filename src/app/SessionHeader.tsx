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
    <header className="w-full relative">
      {!session || session === null ? (
        <button
          onClick={() => signIn("github")}
          className="border mt-1 border-black rounded-lg px-4 py-1 absolute top-3 right-4 signup-btn md:px-6 md:py-3"
        >
          Sign in with GitHub
        </button>
      ) : (
        <>
        <div className="absolute w-full top-2 flex flex-col justify-center items-center md:relative">
          <p className="md:text-[26px] text-[20px] font-serif top-2 left-2 md:absolute text-wrap">Welcome, <span className="text-gray-600 font-semibold">{session.user?.name}</span></p>
          <button onClick={() => signOut()} className="text-sm  md:absolute  md:text-base border mt-1 border-black rounded-lg px-2 py-1 top-3 right-4 signup-btn md:px-6 md:py-3">
            Sign out
          </button>
        </div>
          
        </>
      )}
    </header>
  );
};

export default SessionHeader;
