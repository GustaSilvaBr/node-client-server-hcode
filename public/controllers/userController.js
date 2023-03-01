class UserController {
  constructor(formId, tBodyId, formUpdateId) {
    this.formEl = document.getElementById(formId);
    this.tBodyEl = document.getElementById(tBodyId);
    this.formUpdate = document.getElementById(formUpdateId);

    this.onSubmit();
    this.onEditCancel();
    this.onLoad();

    // this.searchByName();
    // this.searchByTypeOfUser();
    // this.searchByBirth();
    this.nameInSearch = "";
    this.typeOfUserInSearch = "";
    this.birthInSearch = "";
    this.updateCount();
  }

  onLoad() {
    window.addEventListener("DOMContentLoaded", () => {
      this.handleFilterSearch();
    });
  }

  selectAll(users) {
    users.forEach((userData) => {
      let user = new User();

      user.loadFromJSON(userData);

      this.addLine(user);
    });
  }

  searchByBirth() {
    document
      .getElementById("inputToSearchByBirth")
      .addEventListener("input", (e) => {
        this.birthInSearch = e.target.value;
        this.handleFilterSearch();
      });
  }

  searchByName() {
    document
      .getElementById("inputToSearchByName")
      .addEventListener("input", (e) => {
        this.nameInSearch = e.target.value;
        this.handleFilterSearch();
      });
  }

  searchByTypeOfUser() {
    document
      .getElementById("inputToSearchByType")
      .addEventListener("input", (e) => {
        this.typeOfUserInSearch = e.target.value;
        this.handleFilterSearch();
      });
  }

  handleFilterSearch() {
    this.getUsersFromRestAPI((response) => {
      this.filterSearch(response.users);
    })
  }

  filterSearch(users) {
    let usersFiltered = [];

    switch (this.typeOfUserInSearch) {
      case "admin":
        usersFiltered = users.filter((user) => user["_admin"]);
        break;
      case "notAdmin":
        usersFiltered = users.filter(
          (user) => !user["_admin"]
        );
        break;
      default:
        usersFiltered = users;
    }

    usersFiltered = usersFiltered.filter((user) => {
      const name = user["_name"];
      const birth = new Date(user["_birth"]);

      if (
        (name.toUpperCase().startsWith(this.nameInSearch.toUpperCase()) ||
          this.nameInSearch.trim().length <= 0) &&
        (birth.getTime() >= new Date(this.birthInSearch).getTime() ||
          this.birthInSearch.trim().length <= 0)
      ) {
        return user;
      }
    });

    [...this.tBodyEl.rows].forEach((row) => {
      this.tBodyEl.removeChild(row);
    });
    this.selectAll(usersFiltered);
  }

  onSubmit() {
    this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();

      let btn = this.formEl.querySelector("[type=submit]");

      btn.disabled = true;

      let values = this.getFormValues(this.formEl);

      values["_id"] = Date.now();

      if (values) {
        this.getPhoto(this.formEl, true).then(
          (content) => {
            values.photo = content;
            this.addLine(values);
            this.insertInStorage(values);
            this.updateCount();
            this.formEl.reset();
            btn.disabled = false;
          },
          (error) => {
            console.error(error);
          }
        );
      }
    });
  }

  onEditCancel() {
    document
      .querySelector("#box-user-update .btn-cancel")
      .addEventListener("click", (e) => {
        this.changeFormVisibility();
      });

    this.formUpdate.addEventListener("submit", (event) => {
      //When the current form is in update mode and has submit event
      event.preventDefault();

      let updateButton = this.formUpdate.querySelector("[type=submit]");

      updateButton.disabled = true;

      let updatedValues = this.getFormValues(this.formUpdate);

      if (updatedValues) {
        this.getPhoto(this.formUpdate, false).then(
          (content) => {
            updatedValues.photo = content;
            this.updateUserLine(updatedValues);
            this.updateCount();
            this.formUpdate.reset();
            updateButton.disabled = false;
            this.changeFormVisibility();
          },
          (error) => {
            console.error(error);
          }
        );
      }
    });
  }

  updateUserLine(updatedValues) {
    const userId = this.formUpdate.dataset.trIndex;

    let userTableLine = this.tBodyEl.rows[userId];

    let oldUserTableLine = JSON.parse(userTableLine.dataset.user);

    let assignResult = Object.assign({}, oldUserTableLine, updatedValues);

    if (!updatedValues.photo) {
      assignResult._photo = oldUserTableLine._photo;
    }

    let user = new User();

    user.loadFromJSON(assignResult);

    this.getTableRow(user, userTableLine);

    this.updateInStorage(assignResult);
  }

  changeFormVisibility() {
    [
      document.getElementById("box-user-update").style.display,
      document.getElementById("box-user-create").style.display,
    ] = [
        document.getElementById("box-user-create").style.display,
        document.getElementById("box-user-update").style.display,
      ];
  }

  getPhoto(photoForm, hasToGiveDefaultPhoto) {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();

      let filterElements = [...photoForm.elements].filter((element) => {
        if (element.name === "photo") {
          return element;
        }
      });

      let filePhoto = filterElements[0].files[0];

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (e) => {
        reject(e);
      };

      if (filePhoto) {
        fileReader.readAsDataURL(filePhoto);
      } else {
        if (hasToGiveDefaultPhoto) {
          resolve("dist/img/boxed-bg.jpg");
        } else {
          resolve();
        }
      }
    });
  }

  getFormValues(formEl) {
    let user = {};
    let isValid = true;

    [...formEl.elements].forEach(function (field, index) {
      if (
        ["name", "email", "password"].indexOf(field.name) > -1 &&
        !field.value
      ) {
        field.parentElement.classList.add("has-error");

        isValid = false;
      }

      if (field.name == "gender") {
        if (field.checked) {
          user[field.name] = field.value;
        }
      } else if (field.name == "admin") {
        user[field.name] = field.checked;
      } else if (field.name == "date") {
        const date = new Date(field.value);
        const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
        const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1
          }`;
        const year = date.getFullYear();

        user[field.name] = `${year}-${month}-${day}`;
      } else {
        user[field.name] = field.value;
      }
    });

    if (!isValid) {
      return isValid;
    }

    return new User(
      user.name,
      user.gender,
      user.birth,
      user.country,
      user.email,
      user.password,
      user.photo,
      user.admin
    );
  }

  getUsersStorage() {
    let users = [];

    if (localStorage.getItem("users")) {
      users = JSON.parse(localStorage.getItem("users"));
    }

    return users;
  }

  getUsersFromRestAPI(callback) {
    HttpRequest.get('/users').then((response) => {
      callback(response)
    }).catch((err) => {
      console.error(err);
    });
  }

  insertInStorage(dataUser) {
    let users = this.getUsersStorage();

    users.push(dataUser);

    localStorage.setItem("users", JSON.stringify(users));
  }

  updateInStorage(updatedUser) {
    const users = this.getUsersStorage().map((user) => {
      if (user._id == updatedUser._id) {
        return updatedUser;
      } else {
        return user;
      }
    });

    localStorage.setItem("users", JSON.stringify(users));
  }

  deletingDatainLocalStorage(userToDelete) {
    const users = this.getUsersStorage()
      .map((user) => {
        if (user._id != userToDelete._id) {
          return user;
        }
      })
      .filter((user) => user != null);

    localStorage.setItem("users", JSON.stringify(users));
  }

  addLine(dataUser) {
    let userTableRow = this.getTableRow(dataUser);

    this.tBodyEl.appendChild(userTableRow);

    // this.updateCount();
  }

  getTableRow(dataUser, userTableRow = null) {
    if (userTableRow === null) userTableRow = document.createElement("tr");

    userTableRow.dataset.user = JSON.stringify(dataUser);

    userTableRow.innerHTML = `
        <td>
          <img src="${dataUser.photo
      }" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${dataUser.admin ? "Sim" : "Não"}</td>
        <td>${Utils.dateBrFormat(dataUser.birth)}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
        </td>`;

    this.addEventsTr(userTableRow);

    return userTableRow;
  }

  addEventsTr(tr) {
    tr.querySelector(".btn-edit").addEventListener("click", (e) => {
      this.changeFormVisibility();

      let jsonUser = JSON.parse(tr.dataset.user);

      this.formUpdate.dataset.trIndex = tr.sectionRowIndex;

      //sectionRowIndex -> get the index from 0

      for (let name in jsonUser) {
        let field = this.formUpdate.querySelector(
          "[name=" + name.replace("_", "") + "]"
        );

        if (field) {
          switch (field.type) {
            case "file":
              continue;
            case "radio":
              field = this.formUpdate.querySelector(
                "[name=" +
                name.replace("_", "") +
                "][value=" +
                jsonUser[name] +
                "]"
              );
              field.checked = true;
              break;
            case "checkbox":
              field.checked = jsonUser[name];
              break;
            case "date":
              const date = new Date(jsonUser[name]);
              const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
              const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1
                }`;
              const year = date.getFullYear();

              field.value = `${year}-${month}-${day}`;

              break;
            default:
              field.value = jsonUser[name];
          }
        }
      }

      this.formUpdate.querySelector(".photo").src = jsonUser._photo;
    });

    tr.querySelector(".btn-delete").addEventListener("click", (e) => {
      if (confirm("Deseja realmente excluir?")) {
        this.tBodyEl.removeChild(tr);

        const userToDelete = JSON.parse(tr.dataset.user);

        this.deletingDatainLocalStorage(userToDelete);
        this.updateCount();
      }
    });
  }

  updateCount() {
    let numberUsers = this.getUsersStorage().length;
    let numberAdmin = this.getUsersStorage().filter(
      (user) => user["_admin"]
    ).length;

    document.getElementById("numbers-of-users").innerText = `${numberUsers}`;
    document.getElementById("numbers-of-admins").innerText = `${numberAdmin}`;
  }
}
