'use client'
 
export default function SalesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Failed to load sales data</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || 'There was an error loading the sales information. This might be due to a database connection issue or invalid data.'}
      </p>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  )
}