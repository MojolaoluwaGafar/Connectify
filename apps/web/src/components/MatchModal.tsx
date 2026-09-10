// import React from "react";

import Modal from './ui/Modal';

import { useAuth } from '../context/authContext/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLikes } from '../context/likeContext/useLikes';
// import"../App.css"

export const MatchesModal = () => {
  const { justMatched, clearMatch } = useLikes();
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <Modal isOpen={Boolean(justMatched)} onClose={clearMatch}>
      <div className="text-center space-y-4">
        <h1 className="font-fraunces text-[32px] font-semibold text-theme">
          It's a Match
        </h1>
        <p className="text-[#6B6178] font-regular font-400 font-geist">
          You and {justMatched?.fullName.split(' ')[0]} both liked each other
        </p>
      </div>
      {/* avatar */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* you */}
        {!profile ? (
          <div className="bg-theme text-white w-18 h-18 text-2xl text-center flex justify-center items-center rounded-full">
            Y
          </div>
        ) : (
          <div>
            <img
              src={profile?.profilePicture || ''}
              alt={profile?.fullName || ''}
              className="size-16 rounded-full"
            />
          </div>
        )}
        {/* HEART */}
        <div>
          <img
            src={'/heart-overlay.png'}
            alt="Heartoverlay"
            className="size-14"
          />
        </div>
        {/* other user */}
        <div>
          <img
            src={justMatched?.profilePicture || ''}
            alt={justMatched?.fullName || ''}
            className="size-16 rounded-full"
          />
        </div>
      </div>
      {/* btn */}
      <div className="flex flex-col gap-2">
        <button
          className=" bg-theme text-white py-2 px-4 rounded-lg hover:bg-[#6b32cf] font-medium font-geist"
          onClick={() => {
            navigate('/messages', {
              state: {
                selectedUser: justMatched,
              },
            });
            clearMatch();
          }}
        >
          Send a Message
        </button>
        <button
          onClick={clearMatch}
          className="bg-gray-50 text-violet-700 py-2 px-4 rounded-lg font-medium font-geist hover:bg-violet-100"
        >
          Keep Browsing
        </button>
      </div>
    </Modal>
  );
};
