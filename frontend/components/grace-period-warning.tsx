'use client'

export function GracePeriodWarning() {
  const handleUpdatePayment = async () => {
    const response = await fetch('/api/customer-portal', {
      method: 'POST',
    })
    const { url } = await response.json()
    if (url) {
      window.location.href = url
    }
  }

  return (
    <div className="mb-6 rounded-lg border-2 border-warning/30 bg-warning/5 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-warning">Payment Issue</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t process your recent payment. Please update your
            payment method to continue your subscription.
          </p>
          <button
            onClick={handleUpdatePayment}
            className="mt-4 inline-block rounded-lg bg-warning px-6 py-3 text-sm font-semibold text-warning-foreground shadow-md hover:bg-warning/90 transition-all"
          >
            Update Payment Method
          </button>
        </div>
      </div>
    </div>
  )
}