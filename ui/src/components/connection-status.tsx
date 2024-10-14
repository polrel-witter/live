import { Dot } from "lucide-react"



const ConnectionStatus: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-end">
      <div className="flex items-center justify-center mr-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <p className="ml-2 text-xs">connected</p>
      </div>
    </div>
  )
}

export { ConnectionStatus }
