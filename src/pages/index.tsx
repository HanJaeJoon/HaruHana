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

  const test = 1;

  console.log(1)

  if (test) {
    console.log(test + 1)
  }

  if (session) {
    return (
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
    );
  }

  return (
    <>
      <main>
        <h1>todo</h1>
        <div>
          <button
            onClick={() => {
              signIn("google").catch(console.log);
            }}
          >
            Login with Google
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              signIn("github").catch(console.log);
            }}
          >
            Login with GitHub
          </button>
        </div>
      </main>
    </>
  );
};

export default Home;
