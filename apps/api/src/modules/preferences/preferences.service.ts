export async function getPreferences(_userId: string | undefined) {
  return {
    message: 'Notification preferences are scheduled for the next backend milestone.',
    status: 'not_implemented',
    userId: _userId,
  }
}

export async function updatePreferences(_userId: string | undefined, _payload: unknown) {
  return {
    message: 'Preference updates are scheduled for the next backend milestone.',
    status: 'not_implemented',
    userId: _userId,
    payload: _payload,
  }
}
