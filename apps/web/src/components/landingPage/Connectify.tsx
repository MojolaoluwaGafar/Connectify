// Imports the first profile image used in the stacked images
import { useNavigate } from 'react-router-dom';

// Imports the first profile image used in the stacked image design
import profile1 from '../../assets/profile-1.png.png';

// Imports the second profile image used in the stacked image design
import profile2 from '../../assets/profile-2.png.png';

// Imports the third profile image used in the stacked image design
import profile3 from '../../assets/profile-3.png.png';

const Connectify = () => {
  // Creates the navigate function.
  // We use this to take the user to the Sign Up page
  // when they click "Join Connectify Free".
  const navigate = useNavigate();

  return (
    // ================= CONNECTIFY SECTION =================
    <section
      id="about"
      className="w-full bg-white px-5.75 py-14 md:px-0 md:py-20"
    >
      {/* Main content container */}
      <div className="mx-auto w-full max-w-127.5 md:w-6xl md:max-w-none">
        {/* =========================================================
            LEFT CONTENT
            Contains:
            1. Heading
            2. Description
            3. Join Connectify Free button
        ========================================================= */}
        <div className="w-full flex flex-col md:w-130">
          {/* ================= HEADING ================= */}
          <div className="w-full h-auto md:w-130">
            <h2 className="m-0 w-full font-['Fraunces'] text-center lg:text-start font-semibold text-[36px] leading-11 text-[#1C1524] md:w-130 md:text-[36px] md:leading-10">
              We exist to bring people
              <br />
              closer to love
            </h2>
          </div>

          {/* ================= DESCRIPTION ================= */}
          <div className="mt-6 w-full h-auto md:w-130 md:mt-6">
            <p className="m-0 w-full font-['Inter'] font-normal text-center lg:text-start text-[22px] leading-8.25 text-[#6B6178] md:w-130 md:text-[16px] md:leading-6">
              We want our members to find genuine connections with people who
              truly understand them, because great relationships start with what
              you love.
            </p>
          </div>

          {/* ================= JOIN CONNECTIFY BUTTON ================= */}
          <div className="mt-9 w-74.75 h-16 md:mt-8 md:w-52.25 md:h-13 lg:flex lg:justify-center lg:items-center mx-auto lg:mx-0">
            <button
              // When the button is clicked,
              // navigate to the Sign Up page.
              onClick={() => navigate('/signup')}
              className="w-74.75 h-16 rounded-[18px] bg-theme px-6 py-4 md:w-52.25 md:h-13 md:rounded-[14px] md:px-5 md:py-3.5"
            >
              {/* Button text */}
              <span className="font-['Inter'] font-semibold text-[22px] leading-8 text-center text-white md:text-[16px] md:leading-6">
                Join Connectify Free
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================
            PROFILE IMAGES

            These three images are positioned on top of each other
            to create the stacked/profile-card design from Figma.
        ========================================================= */}
        <div className="relative mx-auto mt-17 w-85.75 lg:w-127.5 h-87.5 md:-mt-62.5 lg:-mt-75 md:ml-145 md:w-130 md:h-95">
          {/* ================= PROFILE IMAGE 1 ================= */}
          {/* 
            This is the image at the back.
            It is slightly rotated clockwise.
          */}
          <img
            src={profile1}
            alt="Connectify member"
            className='absolute top-3 z-10 w-45 h-60 lg:h-80 lg:w-70'
            // className="absolute left-4 top-3 z-10 w-50 h-75 rounded-[20px] object-cover md:left-0 md:top-5 md:w-56 md:h-78.5 md:rounded-[20px]"
            style={{
              // Rotates the first image slightly clockwise
              // transform: 'rotate(-4deg)',

              // Adds the small shadow underneath the image
              // boxShadow: '0px 8px 10px -6px #0000001A',
            }}
          />

          {/* ================= PROFILE IMAGE 2 ================= */}
          {/*
            This is the middle image.
            It stays straight and sits above profile 1.
          */}
          <img
            src={profile2}
            alt="Connectify member"
            className='absolute left-20 top-3 z-20 w-50 sm:h-55 lg:h-80 lg:w-60 lg:top-15 lg:left-23'
            // className="absolute left-37.5 top-0 z-20 w-56 h-78.5 rounded-[20px] object-cover md:left-33.5 md:top-0 md:w-56 md:h-78.5 md:rounded-[20px]"
            style={{
              // Keeps the middle image straight
              transform: 'rotate(0deg)',

              // Adds the small shadow underneath the image
              // boxShadow: '0px 8px 10px -6px #0000001A',
            }}
          />

          {/* ================= PROFILE IMAGE 3 ================= */}
          {/*
            This is the front image.
            It is slightly rotated counter-clockwise
            and appears above the other two images.
          */}
          <img
            src={profile3}
            alt="Connectify member"
            className='absolute left-40 top-8 z-30 w-45 h-60 lg:h-80 lg:w-65 lg:top-20'
            // className="absolute left-67.5 top-8 z-30 w-56 h-75 rounded-[20px] object-cover md:left-63.75 md:top-8 md:w-56 md:h-75 md:rounded-[20px]"
            style={{
              // Rotates the third image slightly counter-clockwise
              transform: 'rotate(1deg)',

              // Adds the small shadow underneath the image
              // boxShadow: '0px 8px 10px -6px #0000001A',
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Connectify;
