export async function likeProfile(_profileId: string, _payload: unknown) {
  return {
    message: 'Likes are scheduled for the next backend milestone.',
    status: 'not_implemented',
    profileId: _profileId,
    payload: _payload,
  }
}

export async function unlikeProfile(_profileId: string) {
  return {
    message: 'Removing likes is scheduled for the next backend milestone.',
    status: 'not_implemented',
    profileId: _profileId,
  }
}
