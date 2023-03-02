class UserController {
  constructor(formId, tBodyId, formUpdateId) {
    this.formEl = document.getElementById(formId);
    this.tBodyEl = document.getElementById(tBodyId);
    this.formUpdate = document.getElementById(formUpdateId);

    this.onSubmit();
    this.onEditCancel();
    this.onLoad();

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

            this.insertInRestify(values).then((response) => {
              this.handleFilterSearch();
            }).catch((err) => {
              console.error(err);
            })

          },
          (error) => {
            console.error(error);
          }
        ).catch((err) => {
          console.error(err);
        }).finally(() => {
          this.formEl.reset();
          btn.disabled = false;
        });
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

      const updatedValues = this.getFormValues(this.formUpdate);

      if (updatedValues) {
        this.getPhoto(this.formUpdate, false).then(
          (content) => {
            updatedValues.photo = content;

            const userUpdated = this.getUserUpdated(updatedValues);

            this.updateInRestify(userUpdated).then((response) => {
              this.handleFilterSearch();
            })

          },
          (error) => {
            console.error(error);
          }
        ).catch((err) => {
          console.error(err);
        }).finally(() => {
          this.formUpdate.reset();
          updateButton.disabled = false;
          this.changeFormVisibility();
        });
      }
    });
  }

  getUserUpdated(updatedValues) {
    const userId = this.formUpdate.dataset.trIndex;

    const oldUserTableLine = this.tBodyEl.rows[userId];

    const oldUserObjectInLine = JSON.parse(oldUserTableLine.dataset.user);

    const assignResult = Object.assign({}, oldUserObjectInLine, updatedValues);

    if (!updatedValues.photo) {
      assignResult._photo = oldUserObjectInLine._photo;
    }

    const newUser = new User();

    newUser.loadFromJSON(assignResult);

    return newUser;
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

  insertInRestify(dataUser) {

    return new Promise((resolve, reject) => {
      HttpRequest.post('/users', dataUser).then((response) => {
        resolve(response);
      }).catch((err) => {
        reject(err);
      })

    });

  }

  updateInRestify(updatedUser) {

    return new Promise((resolve, reject) => {
      HttpRequest.put(`/users/${updatedUser._id}`, updatedUser).then((response) => {
        resolve(response);
      }).catch((err) => {
        reject(err);
      });
    });

  }

  deletingDataInLocalStorage(userToDelete) {

    HttpRequest.delete(`/users/${userToDelete._id}`).then((response) => {
      this.handleFilterSearch();
    }).catch((err) => {
      console.error(err);
    });

  }

  addLine(dataUser) {
    const newUserTableRow = this.getUserTableRow(dataUser);

    this.tBodyEl.appendChild(newUserTableRow);
  }

  updateUserTableRow(user) {
    const userId = this.formUpdate.dataset.trIndex;

    const tableRow = this.tBodyEl.rows[userId];

    tableRow.dataset.user = JSON.stringify(user);

    tableRow.innerHTML = `
        <td>
          <img src="${user.photo
      }" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.admin ? "Sim" : "Não"}</td>
        <td>${Utils.dateBrFormat(user.birth)}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
        </td>`;

    this.addEventsTr(tableRow);
  }

  getUserTableRow(user) {
    const tableRow = document.createElement("tr");

    tableRow.dataset.user = JSON.stringify(user);

    tableRow.innerHTML = `
        <td>
          <img src="${user.photo
      }" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.admin ? "Sim" : "Não"}</td>
        <td>${Utils.dateBrFormat(user.birth)}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
        </td>`;

    this.addEventsTr(tableRow);

    return tableRow;
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
    });

    tr.querySelector(".btn-delete").addEventListener("click", (e) => {
      if (confirm("Deseja realmente excluir?")) {
        this.tBodyEl.removeChild(tr);

        const userToDelete = JSON.parse(tr.dataset.user);

        this.deletingDataInLocalStorage(userToDelete);
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
