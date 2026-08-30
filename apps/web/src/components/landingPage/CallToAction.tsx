import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  // Creates the navigation function
  // so the button can take the user to the Sign Up page.
  const navigate = useNavigate();

  return (
    // ================= CALL TO ACTION SECTION =================
    <section className="w-full px-4 py-5 md:px-0 md:py-14" id="contact">
      {/* Purple CTA container */}
      {/* Mobile keeps the current design */}
      {/* Desktop is reduced to match the Figma design */}
      <div className="mx-auto w-85.75 h-73 px-6 py-10 rounded-3xl bg-theme flex flex-col items-center gap-4 md:w-3xl md:h-64 md:px-0 md:py-10 md:rounded-3xl md:gap-3">
        {/* ================= HEADING ================= */}
        {/* Holds the main CTA heading */}
        <div className="w-73.75 h-16 md:w-3xl md:h-10.75">
          {/* Main CTA heading */}
          <h3 className="w-73.75 h-16 mx-auto m-0 font-['Fraunces'] font-semibold text-[26px] leading-8 text-center text-[#FFFFFF] md:w-3xl md:h-10.75 md:text-[36px] md:leading-10.75">
            Ready to find your people?
          </h3>
        </div>

        {/* ================= SUBTITLE ================= */}
        {/* Holds the supporting text underneath the heading */}
        <div className="w-73.75 h-16.5 mx-auto md:w-150 md:h-12">
          {/* CTA supporting text */}
          <p className="w-73.75 h-16.5 mx-auto m-0 font-['Inter'] font-normal text-[15px] leading-5.5 text-center text-[#EDE9FE] md:w-150 md:h-12 md:text-[16px] md:leading-6">
            It only takes a couple of minutes to set up your profile and start
            discovering real connections.
          </p>
        </div>

        {/* ================= JOIN CONNECTIFY BUTTON ================= */}
        {/* Button container */}
        <div className="w-73.75 h-12.5 mx-auto pt-2 md:w-52.25 md:h-13 md:pt-0">
          {/* Join Connectify Free button */}
          <button
            // Sends the user to the Sign Up page
            onClick={() => navigate('/signup')}
            className="block w-52.25 h-10.5 mx-auto px-6 py-3 rounded-xl bg-[#FFFFFF] md:w-52.25 md:h-13 md:py-3.5 md:rounded-[14px]"
          >
            {/* Button text */}
            <span className="w-40.25 h-6 font-['Inter'] font-semibold text-[16px] leading-6 text-center text-[#6D28D9]">
              Join Connectify Free
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
