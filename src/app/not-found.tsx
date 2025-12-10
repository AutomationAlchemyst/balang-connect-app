import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Waves } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="glass-panel-static p-12 max-w-lg border-none shadow-2xl">
        <div className="bg-brand-cyan/10 p-4 rounded-full inline-block mb-6">
            <Waves className="h-12 w-12 text-brand-cyan" />
        </div>
        <h1 className="font-display font-black text-6xl text-brand-blue mb-4">404</h1>
        <h2 className="font-display font-bold text-2xl text-brand-blue uppercase mb-4">Page Not Found</h2>
        <p className="text-brand-blue/60 font-medium mb-8">
          Looks like you've drifted a bit too far from the shore. The page you are looking for doesn't exist.
        </p>
        <Button asChild className="btn-coast-primary h-12 px-8 text-lg">
          <Link href="/">Back to Safety</Link>
        </Button>
      </div>
    </div>
  )
}
