import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext/useAuth";
import { useNavigate } from "react-router-dom";
import { themedToast } from "../utils/ToastFeedback";
import {
  NEW_MATCHES_STORAGE_KEY,
  NEW_MESSAGES_STORAGE_KEY,
} from "../utils/notificationPreferences";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

const Settings = () => {
  const navigate = useNavigate();

  const { user, logout, changePassword, deleteAccount } = useAuth();
  const [newMatches, setNewMatches] = useState(() => {
    const savedMatches = localStorage.getItem(NEW_MATCHES_STORAGE_KEY);
    return savedMatches !== null ? JSON.parse(savedMatches) : true;
  });

  const [newMessages, setNewMessages] = useState(() => {
    const savedMessages = localStorage.getItem(NEW_MESSAGES_STORAGE_KEY);
    return savedMessages !== null ? JSON.parse(savedMessages) : true;
  });

  const [accountDeleted, setAccountDeleted] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      themedToast.error("Fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      themedToast.error("New password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      themedToast.success("Password changed successfully.");
      resetPasswordForm();
      setPasswordModalOpen(false);
    } catch (error) {
      themedToast.error(getErrorMessage(error, "Failed to change password."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (isDeletingAccount) return;

    setIsDeletingAccount(true);
    try {
      await deleteAccount();

      localStorage.removeItem(NEW_MATCHES_STORAGE_KEY);
      localStorage.removeItem(NEW_MESSAGES_STORAGE_KEY);

      setDeleteModalOpen(false);
      setAccountDeleted(true);
      themedToast.success("Your account has been deleted.");
      setTimeout(() => {
        navigate("/signup");
      }, 2000);
    } catch (error) {
      themedToast.error(getErrorMessage(error, "Failed to delete account."));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleLogout = async () => {
  if (isLoggingOut) return;

  setIsLoggingOut(true);

  try {
    setLogoutModalOpen(false);

    await logout();

    setLoggedOut(true);

    themedToast.success('You have been logged out successfully.');

    setTimeout(() => {
      navigate("/signup");
    }, 2000);
  } catch (error) {
    console.error('Logout failed:', error);

    themedToast.error(
      error instanceof Error
        ? error.message
        : 'Logout failed. Please try again.',
    );
  } finally {
    setIsLoggingOut(false);
  }
};
  return (
    <>
      <main
        className="w-full mx-auto flex min-h-[831px] max-w-[1440px] flex-col gap-8
          bg-white px-4 pb-[80px] pt-[48px] md:px-8 lg:px-[240px]"
      >
        <section className="flex w-full flex-col gap-1">
          <h1 className="font-serif text-[32px] font-bold leading-[38px] text-gray-900">
            Settings
          </h1>
          <p className="text-gray-500 leading-[19px] text-[16px]">
            Manage your account preferences
          </p>
        </section>

        <section
          className="mx-auto mt-5 w-full max-w-[960px]
             border border-[#1C152414] rounded-[16px] p-6 bg-white"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2 className="text-[16px] font-semibold text-[#1C1524]">
              Account
            </h2>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-[14px] text-[#6B6575]">Email</span>
            <span className="text-[14px] font-semibold text-[#1C1524]">
              {user?.email ?? "—"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="mt-5 text-left text-[14px] font-medium text-purple-600 hover:underline"
          >
            change password
          </button>
        </section>

        <section className="mx-auto mt-5 w-full max-w-[960px] rounded-[16px] border border-[#1C152414] bg-white p-6">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0.74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
            </svg>
            <h2 className="text-[16px] font-semibold text-[#1C1524]">
              Notifications
            </h2>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-[14px] text-[#6B6575]">New matches</span>
            <button
              type="button"
              onClick={() => {
                const newValue = !newMatches;
                setNewMatches(newValue);
                localStorage.setItem(NEW_MATCHES_STORAGE_KEY, JSON.stringify(newValue));
              }}
              className={`relative h-6 w-11 rounded-full transition ${
                newMatches ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label="Toggle new matches notifications"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  newMatches ? "right-1" : "left-1"
                }`}
              ></span>
            </button>
          </div>

          <div className="my-5 h-px bg-[#1C152414]"></div>

          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#6B6575]">New messages</span>
            <button
              type="button"
              onClick={() => {
                const newValue = !newMessages;
                setNewMessages(newValue);
                localStorage.setItem(NEW_MESSAGES_STORAGE_KEY, JSON.stringify(newValue));
              }}
              className={`relative h-6 w-11 rounded-full transition ${
                newMessages ? "bg-purple-600" : "bg-gray-300"
              }`}
              aria-label="Toggle new messages notifications"
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  newMessages ? "right-1" : "left-1"
                }`}
              ></span>
            </button>
          </div>
        </section>

        <section className="mx-auto mt-5 w-full max-w-[960px] rounded-[16px] border border-[#FEE2E2] bg-[#FEF2F2] p-6">
          <div className="flex items-center gap-2 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
            <h2 className="text-[16px] font-semibold">Danger zone</h2>
          </div>

          <p className="mt-5 text-[14px] text-red-500">
            Deleting your account removes your profile and matches permanently.
          </p>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="mt-5 rounded-[6px] bg-red-500 px-4 py-2 text-[14px] font-medium text-white"
          >
            Delete account
          </button>

          {accountDeleted && (
            <p className="mt-3 text-[14px] font-medium text-red-600">
              Your account has been deleted.
            </p>
          )}
        </section>

        <section className="mx-auto mt-5 w-full max-w-[960px]">
          <button
            type="button"
            onClick={() => setLogoutModalOpen(true)}
            className="mt-5 flex h-[37px] w-[108px] items-center justify-center gap-2 rounded-[8px]
  border border-[#1C152414] bg-white px-4 py-[10px] text-[#1C1524] text-[14px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              color="#ef4444"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="text-[14px] text-[#ef4444]">Log out</span>
          </button>

          {loggedOut && (
            <p className="mt-3 text-[14px] font-medium text-gray-600">
              You have been logged out.
            </p>
          )}
        </section>
      </main>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="flex h-70 w-full max-w-lg flex-col items-center justify-center rounded-xl bg-white p-10 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete account?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="w-full rounded-md border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeletingAccount ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="flex w-full max-w-lg flex-col rounded-xl bg-white p-10 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Change password
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Enter your current password and choose a new one.
            </p>
            <div className="mt-6 flex w-full flex-col gap-3">
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                onClick={() => {
                  setPasswordModalOpen(false);
                  resetPasswordForm();
                }}
                className="w-full rounded-md border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {isChangingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="flex h-70 w-full max-w-lg flex-col            items-center justify-center rounded-xl bg-white p-10 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Log out?</h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              Are you sure you want to log out of your account?
            </p>
            <div className="mt-6 flex w-full flex-col gap-3">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="w-full rounded-md border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
