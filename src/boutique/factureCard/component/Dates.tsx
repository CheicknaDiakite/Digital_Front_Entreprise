
export default function Dates({ invoiceDate}: any) {
  return (
    <article className="mt-10 mb-14 flex items-end justify-end">
      <ul>
        {/* <li className="p-1 ">
          <span className="font-bold">numero du client:</span> {invoiceNumber}
        </li> */}
        <li className="p-1 bg-gray-100">
          <span className="font-bold">date:</span> {invoiceDate}
        </li>
        {/* <li className="p-1 ">
          <span className="font-bold">Due date:</span> {dueDate}
        </li> */}
      </ul>
    </article>
  )
}
