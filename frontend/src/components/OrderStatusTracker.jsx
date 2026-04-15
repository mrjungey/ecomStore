import { Check } from "lucide-react" 

const steps = ["pending", "confirmed", "processing", "shipped", "delivered"] 

export default function OrderStatusTracker({ currentStatus, history }) {
  if (currentStatus === "cancelled") {
    return (
      <div className="border border-red-200 bg-red-50 rounded p-3 text-sm text-red-700">
        This order has been cancelled.
      </div>
    ) 
  }

  const currentIdx = steps.indexOf(currentStatus) 

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {steps.map((step, i) => {
        const done = i <= currentIdx 
        const historyEntry = history?.find((h) => h.status === step) 

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium " +
                  (done ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500")
                }
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className="text-xs mt-1 capitalize text-gray-600">{step}</span>
              {historyEntry && (
                <span className="text-[10px] text-gray-400">
                  {new Date(historyEntry.date).toLocaleDateString()}
                </span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={
                  "w-8 h-0.5 " + (i < currentIdx ? "bg-green-600" : "bg-gray-200")
                }
              />
            )}
          </div>
        ) 
      })}
    </div>
  ) 
}
