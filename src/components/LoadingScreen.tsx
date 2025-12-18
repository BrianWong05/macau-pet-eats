import { Loader } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-neutral-500 font-medium">Loading...</p>
      </div>
    </div>
  )
}
