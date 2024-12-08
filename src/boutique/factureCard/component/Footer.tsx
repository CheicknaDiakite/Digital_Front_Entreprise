
export default function Footer({name, email, website, phone, bankAccount, bankName}: any) {
  return (
    <>
      <footer className="footer border-t-2 border-gray-300 pt-5">
        <ul className="flex flex-wrap items-center justify-center">
          <li>
            <span className="font-bold">Nom de l'entreprise:</span> {name}
          </li>
          <li>
            <span className="font-bold">Email de l'entreprise:</span> {email}
          </li>
          <li>
            <span className="font-bold">Numero de l'entreprise:</span> {phone}
          </li>
          <li>
            <span className="font-bold">Bank:</span> {bankName}
          </li>
          {/* <li>
            <span className="font-bold">Account holder:</span> {name}
          </li> */}
          <li>
            <span className="font-bold">Numero de Bank:</span> {bankAccount}
          </li>
          <li>
            <span className="font-bold">Website:</span>{" "}
            <a href={website} target="_blank" rel="noopenner noreferrer">
              {website}
            </a>
          </li>
        </ul>
      </footer>

      <p className="text-center px-5 mt-8 text-xs ">
        Pre_Facture chez D_D{" "}
        <a
          href="https://tsbsankara.com"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Diakite Digital
        </a>
      </p>
    </>
  )
}
