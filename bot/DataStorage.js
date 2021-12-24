const fs = require("fs");

/**
 * @param path [String] hello
 */
class DataStorage {
  constructor(path="./data.json") {
    this.path = path;
    try {
      this._data = JSON.parse(fs.readFileSync(path)) || {};
    } catch (e) {
      this._data = {};
    }
  }
  async sync () {
    try {
      this._data = JSON.parse(fs.readFileSync(path)) || {};
    } catch (e) {
      this._data = {};
    }
    return this._data;
  }
  get data() {
    return this._data;
  }
  set data(value) {
    this._data = value;
    fs.writeFileSync(this.path, JSON.stringify(this._data, null, 2));
  }
  async set(name, value) {
    await this.sync();
    this._data[name] = value;
    this.data = this._data;
  }
}

module.exports = DataStorage;
