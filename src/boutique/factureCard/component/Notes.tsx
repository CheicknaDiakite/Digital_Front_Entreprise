
export default function Notes({notes}: any) {
  return (
    <>
      <section className="mt-10 mb-5">
        <h3>Description des marchandises</h3>
        <p className="lg:w-1/2 text-justify">{notes}</p>
      </section>
    </>
  )
}
