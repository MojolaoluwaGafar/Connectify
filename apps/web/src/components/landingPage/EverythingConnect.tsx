import createProfileIcon from '../../assets/create-profile-icon.svg.svg';
import discoverPeopleIcon from '../../assets/discover-people-icon.svg.svg';
import matchPeopleIcon from '../../assets/match-people-icon.svg.svg';
import RealTimeIcon from '../../assets/real-time-icon.svg.svg';

const EverythingConnect = () => {
  return (
    <section
      className="w-full bg-[#F5F3FF99] px-5.75 py-14 md:px-0 md:py-20"
      id="features"
    >
      {/* Main content container */}
      <div className="mx-auto w-full max-w-128.5 md:w-6xl md:max-w-none">
        {/* Heading + Subtitle */}
        <div className="w-full flex flex-col items-center gap-3 md:w-6xl">
          {/* Heading */}
          <div className="w-full h-22 md:w-6xl md:h-10">
            <h2 className="mx-auto m-0 w-full h-22 text-center font-['Fraunces'] font-semibold text-[36px] leading-11 text-[#1C1524] md:w-133.5 md:h-10 md:text-[36px] md:leading-10">
              Everything you need to connect
            </h2>
          </div>

          {/* Subtitle */}
          <div className="w-full h-15 md:w-6xl md:h-6">
            <p className="mx-auto m-0 w-full h-15 text-center font-['Inter'] font-normal text-[22px] leading-7.5 text-[#6B6178] md:w-95.75 md:h-6 md:text-[16px] md:leading-6">
              Simple tools designed to help you find your people
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 w-full flex flex-col gap-6 md:w-6xl md:grid md:grid-cols-[566px_566px] md:gap-5 md:mt-5">
          {/* ================= CREATE PROFILE ================= */}
          <div
            className="box-border w-full h-70 rounded-3xl p-7.5 flex flex-col gap-5 md:w-141.5 md:h-45.5 md:rounded-2xl md:p-6 md:gap-0"
            style={{
              background: '#FFFFFF',
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Icon */}
            <div
              className="w-15 h-15 rounded-2xl flex items-center justify-center md:w-11 md:h-11 md:rounded-xl"
              style={{
                background: '#EDE9FE',
              }}
            >
              <img
                src={createProfileIcon}
                alt="Create profile"
                className="w-7.5 h-7.5 md:w-5.5 md:h-5.5"
              />
            </div>

            {/* Heading */}
            <div className="w-full h-8.5 md:w-129.5 md:h-7">
              <h3 className="m-0 w-full h-8.5 font-['Fraunces'] font-semibold text-[28px] leading-8.5 text-[#1C1524] md:w-129.5 md:h-7 md:text-[18px] md:leading-7">
                Create A Profile
              </h3>
            </div>

            {/* Description */}
            <div className="w-full h-18 md:w-129.5 md:h-10">
              <p className="m-0 w-full h-18 font-['Inter'] font-normal text-[20px] leading-7.5 text-[#6B6178] md:w-129.5 md:h-10 md:text-[14px] md:leading-5">
                Set up your profile in minutes. Add your interests, photos and a
                short about to let others know who you are.
              </p>
            </div>
          </div>

          {/* ================= DISCOVER PEOPLE ================= */}
          <div
            className="box-border w-full h-70 rounded-3xl p-7.5 flex flex-col gap-5 md:w-141.5 md:h-45.5 md:rounded-2xl md:p-6 md:gap-0"
            style={{
              background: '#FFFFFF',
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Icon */}
            <div
              className="w-15 h-15 rounded-2xl flex items-center justify-center md:w-11 md:h-11 md:rounded-xl"
              style={{
                background: '#EDE9FE',
              }}
            >
              <img
                src={discoverPeopleIcon}
                alt="Discover people"
                className="w-7.5 h-7.5 md:w-5.5 md:h-5.5"
              />
            </div>

            {/* Heading */}
            <div className="w-full h-8.5 md:w-129.5 md:h-7">
              <h3 className="m-0 w-full h-8.5 font-['Fraunces'] font-semibold text-[28px] leading-8.5 text-[#1C1524] md:w-129.5 md:h-7 md:text-[18px] md:leading-7">
                Discover People
              </h3>
            </div>

            {/* Description */}
            <div className="w-full h-18 md:w-129.5 md:h-10">
              <p className="m-0 w-full h-18 font-['Inter'] font-normal text-[20px] leading-7.5 text-[#6B6178] md:w-129.5 md:h-10 md:text-[14px] md:leading-5">
                Browse through profiles of people who share your passions.
                Filter by interest, location and more.
              </p>
            </div>
          </div>

          {/* ================= MATCH AND CONNECT ================= */}
          <div
            className="box-border w-full h-70 rounded-3xl p-7.5 flex flex-col gap-5 md:w-141.5 md:h-45.5 md:rounded-2xl md:p-6 md:gap-0"
            style={{
              background: '#FFFFFF',
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Icon */}
            <div
              className="w-15 h-15 rounded-2xl flex items-center justify-center md:w-11 md:h-11 md:rounded-xl"
              style={{
                background: '#EDE9FE',
              }}
            >
              <img
                src={matchPeopleIcon}
                alt="Match people"
                className="w-7.5 h-7.5 md:w-5.5 md:h-5.5"
              />
            </div>

            {/* Heading */}
            <div className="w-full h-8.5 md:w-129.5 md:h-7">
              <h3 className="m-0 w-full h-8.5 font-['Fraunces'] font-semibold text-[28px] leading-8.5 text-[#1C1524] md:w-129.5 md:h-7 md:text-[18px] md:leading-7">
                Match And Connect
              </h3>
            </div>

            {/* Description */}
            <div className="w-full h-18 md:w-129.5 md:h-10">
              <p className="m-0 w-full h-18 font-['Inter'] font-normal text-[20px] leading-7.5 text-[#6B6178] md:w-129.5 md:h-10 md:text-[14px] md:leading-5">
                Like profiles that catch your eye. When someone likes you back,
                it's a match and the magic begins.
              </p>
            </div>
          </div>

          {/* ================= REAL-TIME CHAT ================= */}
          <div
            className="box-border w-full h-70 rounded-3xl p-7.5 flex flex-col gap-5 md:w-141.5 md:h-45.5 md:rounded-2xl md:p-6 md:gap-0"
            style={{
              background: '#FFFFFF',
              boxShadow:
                '0px 1px 2px -1px #0000000D, 0px 0px 0px 1px #1C15240D',
            }}
          >
            {/* Icon */}
            <div
              className="w-15 h-15 rounded-2xl flex items-center justify-center md:w-11 md:h-11 md:rounded-xl"
              style={{
                background: '#EDE9FE',
              }}
            >
              <img
                src={RealTimeIcon}
                alt="Real-time chat"
                className="w-7.5 h-7.5 md:w-5.5 md:h-5.5"
              />
            </div>

            {/* Heading */}
            <div className="w-full h-8.5 md:w-129.5 md:h-7">
              <h3 className="m-0 w-full h-8.5 font-['Fraunces'] font-semibold text-[28px] leading-8.5 text-[#1C1524] md:w-129.5 md:h-7 md:text-[18px] md:leading-7">
                Real-Time Chat
              </h3>
            </div>

            {/* Description */}
            <div className="w-full h-18 md:w-129.5 md:h-10">
              <p className="m-0 w-full h-18 font-['Inter'] font-normal text-[20px] leading-7.5 text-[#6B6178] md:w-129.5 md:h-10 md:text-[14px] md:leading-5">
                Chat instantly with your matches. Send messages and start
                building real connections today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EverythingConnect;
