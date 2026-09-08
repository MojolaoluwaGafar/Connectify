import { profile, Profile } from "../../model/profile.js"

export async function createProfile(userId: string, data: profile) {
  console.log(data)
  const { fullName, gender, interest, occupation, about, age, location, profilePicture} = data
  const newProfile = await Profile.create( {
      userId, fullName, gender, interest, occupation, about, age, location, profilePicture
    })
 return newProfile
}

export async function listProfiles(_query: unknown) {
  return {
    message: 'Profile discovery is scheduled for the next backend milestone.',
    status: 'not_implemented',
    query: _query,
  }
}

export async function getProfileById(_profileId: string) {
  return {
    message: 'Public profile reads are scheduled for the next backend milestone.',
    status: 'not_implemented',
    profileId: _profileId,
  }
}

export async function getCurrentProfile(_userId: string | undefined) {
  return {
    message: 'Editable profile reads are scheduled for the next backend milestone.',
    status: 'not_implemented',
    userId: _userId,
  }
}

