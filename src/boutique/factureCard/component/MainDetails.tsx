
export default function MainDetails({name, address, numero, coordonne}: any) {
  return (
    <>
        {/* <div className="icon flex justify-center items-center text-4xl mb-4">
          <img src={url} alt="brand" className="h-16 w-16" />
        </div> */}
      <section className="flex flex-col items-end justify-end">
        <h2 className="font-bold text-3xl uppercase mb-1">{name}</h2>
        <p>{address}</p>
        <p>{coordonne}</p>
    
         
        <div className="p-1">
          <span className="font-bold">Tel: </span> {numero}
        </div>
            
      </section>
    </>
  )
}
