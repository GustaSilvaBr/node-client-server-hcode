class User {
  constructor(name, gender, birth, country, email, password, photo, admin, id) {
    this._name = name;
    this._gender = gender;
    this._birth = birth;
    this._country = country;
    this._email = email;
    this._password = password;
    this._photo = photo;
    this._admin = admin;
    this._register = new Date();
    
  }

  get name() {
    return this._name;
  }

  get gender() {
    return this._gender;
  }

  get birth() {
    return this._birth;
  }

  get country() {
    return this._country;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get photo() {
    return this._photo;
  }

  get admin() {
    return this._admin;
  }

  get register() {
    return this._register;
  }

//   get id() {
//     return this._id;
//   }

  set photo(value) {
    this._photo = value;
  }

  loadFromJSON(json) {
    for (let property in json) {
      switch (property) {
        case "_register":
          this[property] = new Date(json[property]);
          break;
        default:
          this[property] = json[property];
          break;
      }

      //esse this se refere ao objeto atual que foi instanciado pela classe User
      //nos gets não há underline então ele chama normal
    }
  }
}
