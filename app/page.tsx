import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1>Welcome to KnowledgeBase</h1>
      <Link href={"/train"}>
        <Button className="mt-10">Get Started</Button>
      </Link>
    </main>
  );
}
