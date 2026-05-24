
const ExpCard = (props:any) => {
  return (
    <div className="flex flex-col gap-2">
       <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <div className="flex gap-2 items-center">
          <div className="p-2 bg-mine-shaft-800 rounded-md shrink-0">
            <img className="h-7" src={`/Icons/${props.company}.png`} alt="" />
          </div>
       
          <div className="flex flex-col min-w-0">
            <div className="font-semibold truncate">{props.title}</div>
            <div className="text-sm text-mine-shaft-300 truncate">{props.company} &#x2022; {props.location}</div>
          </div>
        </div>

        <div className="text-sm text-mine-shaft-300 shrink-0">
            {props.startDate} - {props.endDate} 
        </div>
      </div>

      <div className="text-sm text-mine-shaft-300 text-justify">
        {props.description}
      </div>
    </div>
  )
}

export default ExpCard

