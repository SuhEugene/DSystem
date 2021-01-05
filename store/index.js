
export const state = () => ({
  logs: null,
  dark: false,
  notifications: [],
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
  setCards (state, v)   { state.$auth.user.cards = v },
  changeTheme (state)   { state.dark = !state.dark; localStorage.setItem("dark", state.dark); },
  setTheme (state, theme) { state.dark = theme; localStorage.setItem("dark", theme); },

  setUser (state, user) { state.$auth.user = user; },
  setLoggedIn (state, bool) { state.$auth.loggedIn = bool; },
  setAuthError (state, err) { state.$auth.error = err; },
  setAuthBigError (state, err) { state.$auth.bigError = err; },

  addNotification (state, [{ img=null, title=null, descr=null, type=null}, id]) {
    state.notifications.push({ img, title, descr, type, id });
  },
  removeNotification (state, id) {
    state.notifications = state.notifications.filter(n => n.id != id);
  }
};

export const actions = {
  addNotification ({ commit }, notf){
    const id = Math.random();
    commit("addNotification", [notf, id]);
    setTimeout(() => {
      commit("removeNotification", id);
    }, 7000);
  }
}
