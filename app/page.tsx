import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <Logo variant="default" className="mb-4" />
      <p className="text-lg mb-8 text-muted-foreground">Platform Task-to-Earn</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-border rounded-lg hover:bg-accent"
        >
          Daftar Sekarang
        </Link>
      </div>
    </div>
  );
}

