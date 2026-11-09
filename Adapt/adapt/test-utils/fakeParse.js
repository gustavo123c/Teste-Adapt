/**
 * Parse (Back4App) FALSO, em memoria, usado nos testes de INTEGRACAO.
 * Implementa apenas o que o projeto usa: Parse.Object.extend, Parse.Query,
 * Parse.File e Parse.User.current. Assim os servicos reais (uploadFile,
 * getProvasUser, deleteProva, gerarPDFAdaptado) interagem entre si de verdade,
 * sem rede e sem credenciais.
 */
const store = {};
let counter = 0;
let currentUser = { id: "user-1" };

class FakeFile {
  constructor(name, data) {
    this._name = name;
    this._data = data;
    this._url = null;
  }
  async save() {
    this._url = `https://fake.parse/files/${this._name}`;
    return this;
  }
  url() {
    return this._url;
  }
  name() {
    return this._name;
  }
}

class FakeObject {
  constructor(className) {
    this.className = className;
    this.id = undefined;
    this.createdAt = undefined;
    this.attrs = {};
  }
  set(key, value) {
    this.attrs[key] = value;
    return this;
  }
  get(key) {
    return this.attrs[key];
  }
  async save() {
    if (!this.id) {
      counter += 1;
      this.id = `obj${counter}`;
      this.createdAt = new Date(Date.now() + counter);
      store[this.className] = store[this.className] || [];
      store[this.className].push(this);
    }
    return this;
  }
  async destroy() {
    store[this.className] = (store[this.className] || []).filter((o) => o !== this);
    return this;
  }
  static extend(className) {
    return class extends FakeObject {
      constructor() {
        super(className);
      }
    };
  }
}

class FakeQuery {
  constructor(Cls) {
    this.className = new Cls().className;
    this.filters = [];
    this._limit = Infinity;
    this._desc = false;
  }
  equalTo(key, value) {
    this.filters.push((o) => o.get(key) === value);
    return this;
  }
  exists(key) {
    this.filters.push((o) => o.get(key) !== undefined && o.get(key) !== null);
    return this;
  }
  limit(n) {
    this._limit = n;
    return this;
  }
  descending() {
    this._desc = true;
    return this;
  }
  async find() {
    let rows = (store[this.className] || []).filter((o) => this.filters.every((f) => f(o)));
    rows = [...rows].sort((a, b) => a.createdAt - b.createdAt);
    if (this._desc) rows.reverse();
    return rows.slice(0, this._limit);
  }
  async get(id) {
    const found = (store[this.className] || []).find((o) => o.id === id);
    if (!found) throw new Error("Object not found.");
    return found;
  }
}

const Parse = {
  Object: FakeObject,
  Query: FakeQuery,
  File: FakeFile,
  User: { current: () => currentUser },
};

function reset() {
  Object.keys(store).forEach((k) => delete store[k]);
  counter = 0;
  currentUser = { id: "user-1" };
}

function setCurrentUser(user) {
  currentUser = user;
}

module.exports = { Parse, store, reset, setCurrentUser };
