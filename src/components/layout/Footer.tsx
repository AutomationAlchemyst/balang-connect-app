import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto border-t-4 border-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-display font-bold text-2xl uppercase tracking-wider mb-2 text-brand-yellow">Balang Kepalang</h3>
            <p className="font-body text-gray-400 max-w-xs">Your community beverage partner. Serving flavor, fun, and freshness in every cup.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 font-bold font-body uppercase tracking-wide text-sm">
             <Link href="/flavors" className="hover:text-brand-cyan transition-colors">Flavors</Link>
             <Link href="/packages" className="hover:text-brand-cyan transition-colors">Packages</Link>
             <Link href="/event-builder" className="hover:text-brand-cyan transition-colors">Book Now</Link>
          </div>

          <div className="text-center md:text-right text-sm font-body text-gray-500">
            <p>&copy; {new Date().getFullYear()} Balang Kepalang.</p>
            <div className="mt-1 flex items-center justify-center md:justify-end gap-2">
                <span>Powered by WorkFlowGuys</span>
                <span>·</span>
                <Link href="/admin/login" className="hover:text-brand-yellow transition-colors underline decoration-2 underline-offset-2">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}