import starIcon from '../../assets/stars.svg.svg';

const Testimonials = () => {
  return (
    <section className="w-full px-5.5 py-14 bg-[#F5F3FF99] md:px-0 md:py-20">
      {/* ================= HEADING + SUBTITLE ================= */}
      <div className="mx-auto w-full max-w-139.25 md:w-253 md:max-w-none">
        {/* ================= HEADING ================= */}
        <div className="w-full h-auto md:w-253">
          <h2 className="mx-auto w-full max-w-110.5 m-0 text-center font-['Fraunces'] font-semibold text-[36px] leading-10 text-[#1C1524] md:w-150 md:max-w-none md:text-[36px] md:leading-10">
            What our users are saying
          </h2>
        </div>

        {/* ================= SUBTITLE ================= */}
        <div className="w-full mt-6 md:w-253 md:mt-5">
          <p className="mx-auto w-full max-w-128.5 m-0 text-center font-['Inter'] font-normal text-[22px] leading-8 text-[#6B6178] md:w-180 md:max-w-none md:text-[16px] md:leading-6">
            Thousands of people have already found their people on Connectify
          </p>
        </div>

        {/* ================= TESTIMONIAL CARDS ================= */}
        <div className="w-full mt-10 flex flex-col gap-6 md:w-253 md:mt-10 md:gap-5">
          {/* ================= SARAH MITCHELL ================= */}
          <div
            className="box-border w-full h-58.5 rounded-2xl p-7 bg-white border border-[#1C152414] md:w-253 md:h-44 md:rounded-2xl md:p-6"
            style={{
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Sarah information + stars */}
            <div className="w-full h-15 flex items-center justify-between md:h-13">
              {/* Sarah profile */}
              <div className="h-15 flex items-center gap-3 md:h-13 md:gap-4">
                {/* Initials */}
                <div className="w-15 h-15 rounded-full bg-[#EDE9FE] flex items-center justify-center md:w-13 md:h-13">
                  <span className="font-['Inter'] font-semibold text-[18px] leading-6 text-[#6D28D9] md:text-[16px] md:leading-6">
                    SM
                  </span>
                </div>

                {/* Name */}
                <div className="">
                  <p className="font-['Inter'] font-semibold text-[20px] leading-7 text-[#1C1524] md:text-[18px] md:leading-7">
                    Sarah Mitchell
                  </p>
                </div>
              </div>

              {/* Stars */}
              <div className="w-25 h-5 flex items-center gap-1 md:w-30 md:h-6 md:gap-1">
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </div>
            </div>

            {/* Sarah testimonial */}
            <div className="w-full mt-5">
              <p className="m-0 w-full font-['Inter'] font-normal text-[16px] leading-7 text-[#6B6178] md:text-[16px] md:leading-6">
                "I joined Connectify last month and already made 3 genuine
                friendships. The matching based on interests is so accurate."
              </p>
            </div>
          </div>

          {/* ================= PRIYA SHARMA ================= */}
          <div
            className="box-border w-full h-58.5 rounded-2xl p-7 bg-white border border-[#1C152414] md:w-253 md:h-44 md:rounded-2xl md:p-6"
            style={{
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Priya information + stars */}
            <div className="w-full h-15 flex items-center justify-between md:h-13">
              {/* Priya profile */}
              <div className="w-auto h-15 flex items-center gap-3 md:h-13 md:gap-4">
                {/* Initials */}
                <div className="w-15 h-15 rounded-full bg-[#EDE9FE] flex items-center justify-center md:w-13 md:h-13">
                  <span className="font-['Inter'] font-semibold text-[18px] leading-6 text-[#6D28D9] md:text-[16px] md:leading-6">
                    PS
                  </span>
                </div>

                {/* Name */}
                <div className="">
                  <p className="m-0 font-['Inter'] font-semibold text-[20px] leading-7 text-[#1C1524] md:text-[18px] md:leading-7">
                    Priya Sharma
                  </p>
                </div>
              </div>

              {/* Stars */}
              <div className="w-25 h-5 flex items-center gap-1 md:w-30 md:h-6 md:gap-1">
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </div>
            </div>

            {/* Priya testimonial */}
            <div className="w-full mt-5">
              <p className="m-0 w-full font-['Inter'] font-normal text-[16px] leading-7 text-[#6B6178] md:text-[16px] md:leading-6">
                "The chat feature is so smooth and the profiles feel real.
                Connectify is genuinely different from other platforms and
                that's why I love it."
              </p>
            </div>
          </div>

          {/* ================= JAMES OKAFOR ================= */}
          <div
            className="box-border w-full h-58.5 rounded-2xl p-7 bg-white border border-[#1C152414] md:w-253 md:h-44 md:rounded-2xl md:p-6"
            style={{
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* James information + stars */}
            <div className="w-full h-15 flex items-center justify-between md:h-13">
              {/* James profile */}
              <div className="w-auto h-15 flex items-center gap-4 md:h-13 md:gap-4">
                {/* Initials */}
                <div className="w-15 h-15 rounded-full bg-[#EDE9FE] flex items-center justify-center md:w-13 md:h-13">
                  <span className="font-['Inter'] font-semibold text-[18px] leading-6 text-[#6D28D9] md:text-[16px] md:leading-6">
                    JO
                  </span>
                </div>

                {/* Name */}
                <div className="">
                  <p className="m-0 font-['Inter'] font-semibold text-[20px] leading-7 text-[#1C1524] md:text-[18px] md:leading-7">
                    James Okafor
                  </p>
                </div>
              </div>

              {/* Stars */}
              <div className="w-25 h-5 flex items-center gap-1 md:w-30 md:h-6 md:gap-1">
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
                <img
                  src={starIcon}
                  alt="star"
                  className="w-5 h-5 md:w-6 md:h-6"
                />
              </div>
            </div>

            {/* James testimonial */}
            <div className="mt-5">
              <p className="m-0 w-full font-['Inter'] font-normal text-[16px] leading-7 text-[#6B6178] md:text-[16px] md:leading-6">
                "Finally a platform that connects people based on what they
                actually care about. I love it so much because I found my soul
                mate."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
