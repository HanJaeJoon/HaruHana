import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <main>Loading...</main>;
  }
  
  return (
    <>
      <main>
        <h1>todo</h1>
      <div>
        {session ? (
          <>
            <p>hi {session.user?.name}</p>
            <button
              onClick={() => {
                signOut().catch(console.log);
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              signIn("google").catch(console.log);
            }}
          >
            Login with Google
           </button>
        )}
      </div>
      </main>
    </>
  );
};

export default Home;