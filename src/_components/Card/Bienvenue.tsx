import { TypeAnimation } from "react-type-animation";

export default function Bienvenue() {
  return (
    <div className="text-2xl font-extrabold">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-green-300">
            
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'Bienvenue sur Gest Stock',
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                // 'En cas d\'incompréhension contacter : +223 91 15 48 34',
                // 1000,
                // 'En cas d\'incompréhension contacter : Pour plus d\'information',
                // 1000,
                // 'En cas d\'incompréhension contacter ',
                // 1000
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
        </span>
    </div>
  )
}
