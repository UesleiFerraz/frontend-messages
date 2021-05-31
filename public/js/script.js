axios.defaults.baseURL = "https://backend-scraps.herokuapp.com/";

const token = localStorage.getItem("token");
let userId = "";
let scrapId = localStorage.scrapId ? JSON.parse(localStorage.scrapId) : 1;
const userName = document.querySelector("input");
const password = document.querySelectorAll("input")[1];
const repeatPassword = document.querySelectorAll("input")[2];
const description = document.querySelector("input");
const details = document.querySelectorAll("input")[1];
const usernameError = document.querySelector(".userName");
const passwordError = document.querySelector(".password");
const repeatPasswordError = document.querySelector(".repeatPassword");
const detailsError = document.querySelector(".invalidDetails");
const descriptionError = document.querySelector(".invalidDescription");
const button = document.querySelector("button");
const tBody = document.querySelector("tbody");
const iconShowHidePassword1 = document.querySelectorAll("i")[0];
const iconShowHidePassword2 = document.querySelectorAll("i")[1];
const queryParam = new URLSearchParams(window.location.search).get("error");

function showPassword(event) {
  if (event.target.innerHTML === "visibility_off") {
    event.target.innerHTML = "visibility";
    password.type = "text";
    repeatPassword ? (repeatPassword.type = "text") : "";
  } else {
    event.target.innerHTML = "visibility_off";
    password.type = "password";
    repeatPassword ? (repeatPassword.type = "password") : "";
  }
}

if (document.querySelector("#signUp")) {
  token ? (location = "recados.html") : "";

  userName.addEventListener("keydown", event => {
    usernameError.innerHTML = "";
  });

  password.addEventListener("keydown", event => {
    passwordError.innerHTML = "";
    iconShowHidePassword1.classList.remove("invalid");
  });

  repeatPassword.addEventListener("keydown", event => {
    repeatPasswordError.innerHTML = "";
    iconShowHidePassword2.classList.remove("invalid");
  });

  button.addEventListener("click", async event => {
    !userName.value ? (usernameError.innerHTML = "Username invalido") : "";

    if (password.value.length < 6) {
      passwordError.innerHTML = "A senha deve ter pelo menos 6 caracteres";
      iconShowHidePassword1.classList.add("invalid");
    }

    if (password.value !== repeatPassword.value) {
      repeatPasswordError.innerHTML = "As senhas não são iguais";
      iconShowHidePassword2.classList.add("invalid");
    }

    if (
      userName.value !== "" &&
      password.value.length >= 6 &&
      password.value === repeatPassword.value
    ) {
      try {
        await axios.post("/users", {
          username: userName.value,
          password: password.value,
        });

        userName.value = "";
        password.value = "";
        repeatPassword.value = "";

        repeatPasswordError.innerHTML = "";
        passwordError.innerHTML = "";
        usernameError.innerHTML = "";

        new bootstrap.Modal(document.getElementById("myModal"), {}).show();
      } catch {
        usernameError.innerHTML = "Ja existe um usuario com esse login!";
      }
    }
  });
}

if (document.querySelector("#signIn")) {
  userName.addEventListener("keydown", event => {
    usernameError.innerHTML = "";
    iconShowHidePassword1.classList.remove("invalid");
  });

  password.addEventListener("keydown", event => {
    passwordError.innerHTML = "";
    iconShowHidePassword1.classList.remove("invalid");
  });

  if (queryParam) {
    usernameError.innerHTML = "Voce deve fazer login antes";
    iconShowHidePassword1.classList.add("invalid");
  }

  button.addEventListener("click", async event => {
    try {
      const user = await axios.post("/auth", {
        username: userName.value,
        password: password.value,
      });

      localStorage.setItem("token", user.data.token);
      location = "recados.html";
    } catch (error) {
      if (error.message.includes("406")) {
        passwordError.innerHTML = "Senha invalida";
        iconShowHidePassword1.classList.add("invalid");
      } else {
        usernameError.innerHTML = "nome de usuario não existe";
        iconShowHidePassword1.classList.add("invalid");
      }
    }
  });
}

if (document.querySelector("#saveList")) {
  if (token) {
    try {
      userId = JSON.parse(atob(token.split(".")[1])).userIdToken;
    } catch {
      location = "index.html?error=login";
    }
  } else {
    location = "index.html?error=login";
  }

  async function getScraps() {
    try {
      const data = await axios.get(`/users/${userId}/scraps`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const scraps = await data.data.scraps;

      scraps.forEach(scrap => {
        tBody.innerHTML += `
        <tr id="id_${scrap.id}">
        ${createElement(scrap).innerHTML}
        </tr>
        `;
      });

      button.addEventListener("click", async event => {
        if (!button.id) {
          try {
            const data = await axios.post(
              `/users/${userId}/scraps`,
              {
                description: description.value,
                details: details.value,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const scrap = await data.data.scrap;
            tBody.prepend(createElement(scrap));
            description.value = "";
            details.value = "";

            detailsError.innerHTML = "";
            descriptionError.innerHTML = "";
          } catch {
            detailsError.innerHTML = "Digite os detalhes deste recado";
            descriptionError.innerHTML = "Digite uma descrição";
          }
        } else {
          try {
            const data = await axios.put(
              `/users/${userId}/scraps/${button.id}`,
              {
                description: description.value,
                details: details.value,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const scrap = await data.data.scrap;

            document.querySelector(`#id_${button.id}`).innerHTML =
              createElement(scrap).innerHTML;

            description.value = "";
            details.value = "";
            button.id = "";
          } catch {
            detailsError.innerHTML = "Digite os detalhes deste recado";
            descriptionError.innerHTML = "Digite uma descrição";
          }
        }
      });
    } catch {
      location = "index.html?error=login";
    }
  }

  getScraps();

  function signOff() {
    localStorage.removeItem("token");
    location = "index.html";
  }

  function deleteTodo(id) {
    new bootstrap.Modal(document.getElementById("myModal"), {}).show();

    document
      .querySelector("#excluir")
      .addEventListener("click", async event => {
        event.preventDefault;
        document.querySelector(`#id_${id}`).remove();

        try {
          await axios.delete(`/users/${userId}/scraps/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
      });
  }

  function editTodo(id) {
    const data = document.querySelector(`#id_${id}`);

    description.value = data.querySelector("td").innerText;
    details.value = data.querySelectorAll("td")[1].innerText;

    button.id = id;
  }

  function createElement(scrap, length) {
    let trDOM = document.createElement("tr");
    trDOM.id = `id_${scrap.id}`;
    trDOM.innerHTML = `
      <th scope="row">${++scrapId}</th>
      <td>${scrap.description}</td>
      <td>${scrap.details}</td>
      <td>
      <button type="button" onclick="editTodo('${
        scrap.id
      }')" class="me-2 btn btn-outline-warning">Editar</button>
      <button type="button" onclick="deleteTodo('${
        scrap.id
      }')" class="btn btn-outline-danger">Excluir</button>
      </td>
      `;

    localStorage.setItem("scrapId", scrapId);

    return trDOM;
    
  }
}
