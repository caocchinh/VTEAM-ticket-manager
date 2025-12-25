import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full bg-black relative z-5 mt-4 flex items-center justify-center text-white text-center p-2">
      <Image
        src="/assets/logo.webp"
        width={26}
        height={26}
        className="invert -mt-[2px]"
        alt="VTEAM Logo"
      />
      VTEAM - Vinschool Central Park
    </footer>
  );
};

export default Footer;
