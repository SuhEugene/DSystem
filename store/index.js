
export const state = () => ({
  logs: null,
  dark: false
});
export const mutations = {
  setLogs (state, logs) { state.logs = logs },
  setBal (state, bal)   { state.auth.user.balance = bal },
  changeTheme (state)   { state.dark = !state.dark; localStorage.setItem("dark", state.dark); },
  setTheme (state, theme) { state.dark = theme; localStorage.setItem("dark", theme); }
};