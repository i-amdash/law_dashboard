'use client'
 
export default function SaleDetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Failed to load sale details</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message || 'There was an error loading the sale details. The sale might not exist or there could be a database connection issue.'}
      </p>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={reset}
        >
          Try again
        </button>
        <button
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          onClick={() => window.history.back()}
        >
          Go back
        </button>
      </div>
    </div>
  )
}