export const state = () => ({
  logs: null
});
export const mutations = {
  setLogs (state, logs) { state.logs = logs },
  setBal (state, bal) { state.auth.user.balance = bal }
};