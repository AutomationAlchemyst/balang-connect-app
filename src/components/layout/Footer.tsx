import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-card shadow-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Balang Kepalang By WorkFlowGuys. Designed by Ath Thaariq Marthas. All rights reserved.</p>
        <div className="text-sm mt-2">
            <span>Crafted with ❤️ in Singapore</span>
            <span className="mx-2">·</span>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
