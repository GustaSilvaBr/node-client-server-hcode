class UserController {

    constructor(formId, tBodyId, formUpdateId) {
        this.formEl = document.getElementById(formId);
        this.tBodyEl = document.getElementById(tBodyId);
        this.formUpdate = document.getElementById(formUpdateId);
        this.onSubmit();
        this.onEditCancel();
    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getFormValues(this.formEl);

            if (values) {
                this.getPhoto().then(
                    (content) => {
                        values.photo = content;
                        this.addLine(values);
                        this.formEl.reset();
                        btn.disabled = false;
                    }, (error) => {
                        console.error(error);
                    }
                )
            }
        })

    }

    onEditCancel() {
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {
            this.changeFormVisibility();
        });

        this.formUpdate.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formUpdate.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getFormValues(this.formUpdate);

            const index = this.formUpdate.dataset.trIndex;

            let tr = this.tBodyEl.rows[index];

            tr.dataset.user = JSON.stringify(values);

            tr.innerHTML = `
        <td>
          <img src="${values.photo}" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${values.name}</td>
        <td>${values.email}</td>
        <td>${values.admin ? 'Sim' : 'Não'}</td>
        <td>${Utils.dateFormat(values.register)}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
        </td>`

            this.addEventsTr(tr);

            this.updateCount();
        });


    }

    changeFormVisibility() {
        [document.getElementById('box-user-update').style.display, document.getElementById('box-user-create').style.display]
            =
            [document.getElementById('box-user-create').style.display, document.getElementById('box-user-update').style.display];

    }


    getPhoto() {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let filterElements = [...this.formEl.elements].filter(element => {
                if (element.name === 'photo') {
                    return element;
                }
            });

            let filePhoto = filterElements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e);
            }

            if (filePhoto) {
                fileReader.readAsDataURL(filePhoto);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }
        })
    }

    getFormValues(formEl) {

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');

                isValid = false;
            }


            if (field.name == "gender") {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if (field.name == "admin") {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }

        })

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
            user.admin);
    }

    addLine(dataUser, tBodyId) {

        let userLine = document.createElement("tr");

        userLine.dataset.user = JSON.stringify(dataUser);

        userLine.innerHTML = `
        <td>
          <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm">
        </td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
        <td>${Utils.dateFormat(dataUser.register)}</td>
        <td>
          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
          <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
        </td>`



        this.addEventsTr(userLine);

        this.tBodyEl.appendChild(userLine);

        this.updateCount();
    }

    addEventsTr(tr) {
        tr.querySelector(".btn-edit").addEventListener("click", e => {
            this.changeFormVisibility();

            let jsonUser = JSON.parse(tr.dataset.user);

            this.formUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let name in jsonUser) {
                let field = this.formUpdate.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.formUpdate.querySelector("[name=" + name.replace("_", "") + "][value=" + jsonUser[name] + "]");
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = jsonUser[name];
                            break;
                        default:
                            field.value = jsonUser[name];
                    }

                }

            }

        });
    }

    updateCount() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tBodyEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberAdmin++;
        });
        document.getElementById('numbers-of-users').innerText = `${numberUsers}`;
        document.getElementById('numbers-of-admins').innerText = `${numberAdmin}`;
    }


}