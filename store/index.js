
export const state = () => ({
  logs: null,
  dark: false,
  $auth: {
    user: null,
    loggedIn: false,
    error: false,
    bigError: false
  }
});
export const mutations = {
  setLogs (state, logs) { state.logs = logs },
  setBal (state, bal)   { state.$auth.user.balance = bal },
  changeTheme (state)   { state.dark = !state.dark; localStorage.setItem("dark", state.dark); },
  setTheme (state, theme) { state.dark = theme; localStorage.setItem("dark", theme); },

  setUser (state, user) { state.$auth.user = user; },
  setLoggedIn (state, bool) { state.$auth.loggedIn = bool; },
  setAuthError (state, err) { state.$auth.error = err; },
  setAuthBigError (state, err) { state.$auth.bigError = err; }
};
