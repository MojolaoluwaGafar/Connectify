// Imports the purple connection icon from the assets folder
import connectionIcon from '../../assets/connection-icon.png';
import { useNavigate } from 'react-router-dom';
const Hero = () => {
  // Creates a navigation function so buttons can move the user to different routes
  const navigate = useNavigate();
  return (
    <section className="w-full h-124.25 md:h-127 flex flex-col items-center gap-6 py-12 px-4 md:gap-5 md:pt-16 md:pr-8 md:pb-20 md:pl-8 bg-linear-to-b from-[#F5F3FF] to-white">
      {/* Background pill: contains the connection badge and its text */}
      <div className="relative w-55.25 h-6.75 flex items-center gap-1.5 py-1.5 px-4 rounded-[99px] bg-white md:h-7 md:rounded-full">
        {/* Overlay + shadow: recreates the subtle Figma shadow effect */}
        <div
          className="absolute inset-0 rounded-[99px] pointer-events-none"
          style={{
            background: '#FFFFFF01',
            boxShadow:
              '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A, 0px 0px 0px 1px #EDE9FE',
          }}
        />
        <img src={connectionIcon} alt="Connection Badge" className="w-3 h-3 " />
        {/* Badge text: describes the connection-focused purpose of Connectify */}
        <p className=" text-[12px] leading-4 font-semibold text-[#6D28D9] ">
          {' '}
          Real connections, real people
        </p>
      </div>

      {/* Heading container: controls the size and spacing of the main Hero heading */}
      <div className="w-85.75 h-33 flex items-center justify-center md:w-3xl md:max-w-3xl md:h-38.5 md:pt-1">
        <h1 className="w-85.75 h-33 font-['Fraunces'] font-semibold text-[36px] leading-11 text-center text-[#1C1524] md:w-156 md:h-37.5 md:text-[60px] md:leading-18.75">
          Meet people who share <br />
          your <span className="text-[#6D28D9]">interests</span>
        </h1>
      </div>

      {/* Description container: holds the text below the main heading */}
      <div className="w-85.75 h-16.5 flex items-center justify-center md:w-xl md:max-w-xl md:h-14">
        {/* Description text */}
        <p className=" w-85.75 h-16.5 text-[15px] leading-5.5 font-['Inter'] font-normal text-[#6B6178] text-center md:w-137.75 md:h-14  md:text-[18px] md:leading-7">
          Connectify brings together like-minded people from around the world.
          Discover, connect and chat with people who truly get you.
        </p>
      </div>
      <div className="w-85.75 h-26 flex flex-col gap-3 md:w-full md:h-16.5 md:flex-row md:items-center md:justify-center md:gap-3 md:pt-3">
        {/* Get Started button */}
        {/* Get Started button - takes the user to the Sign Up page */}
        <button
          onClick={() => navigate('/signup')}
          className="w-85.75 h-11.5 px-6 py-3 rounded-xl bg-theme md:w-34.25 md:h-13 md:px-6 md:py-3.5"
        >
          {/* Text displayed inside the Get Started button */}
          <span className="font-['Inter'] font-semibold text-[15px] leading-5.5 text-center text-white md:text-[16px] md:leading-6">
            Get started
          </span>
        </button>

        {/* Login button */}
        {/* Login button - takes the user to the Login page */}

        <button
          onClick={() => navigate('/login')}
          className="w-85.75 h-11.5 px-3 py-3 flex items-center justify-center rounded-xl border border-[#1C152426] md:w-23.25 md:h-13.5 md:px-6 md:py-3.5"
        >
          {/* Text displayed inside the Login button */}

          <span className="font-['Inter'] font-semibold text-[15px] leading-5.5 text-center text-[#1C1524] md:text-[16px] md:leading-6">
            Login
          </span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
