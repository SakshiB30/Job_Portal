
const CertifCard = (props:any) => {
  return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex gap-2 items-center min-w-0">
          <div className="p-2 bg-mine-shaft-800 rounded-md shrink-0">
            <div className="h-7 w-7 rounded bg-gradient-to-br from-bright-sun-400 to-yellow-400 flex items-center justify-center text-[10px] font-bold text-mine-shaft-950">C</div>
          </div>
          
          <div className="flex flex-col min-w-0">
            <div className="font-semibold truncate">{props.name}</div>
            <div className="text-sm text-mine-shaft-300 truncate">{props.issuer}</div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end">
           <div className="text-sm text-mine-shaft-300">{props.issueDate}</div> 
           <div className="text-sm text-mine-shaft-300 truncate">{props.certificateId}</div>
        </div>
      </div>

    
  )
}

export default CertifCard
