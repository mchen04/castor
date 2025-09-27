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
    <div className="mb-6 rounded-lg border border-yellow-500 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-600"
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
          <h3 className="font-semibold text-yellow-800">Payment Issue</h3>
          <p className="mt-1 text-sm text-yellow-700">
            We couldn&apos;t process your recent payment. Please update your
            payment method to continue your subscription.
          </p>
          <button
            onClick={handleUpdatePayment}
            className="mt-3 inline-block rounded bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            Update Payment Method
          </button>
        </div>
      </div>
    </div>
  )
}