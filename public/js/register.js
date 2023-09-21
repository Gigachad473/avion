document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const errorContainer = document.getElementById("errorContainer");
  const loginForm = document.getElementById("loginForm")
  const errorContainer2 = document.getElementById("errorContainer2")

  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const fullName = document.getElementById("registerName").value;

    // Send the form data to the server using fetch or another AJAX method
    const response = await fetch("/createUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName }),
    }).then((response) => {
      console.log(response);

      if (response.status === 201) {
        errorContainer.innerHTML = "Successfully registered";
        errorContainer.style.color = "green";
      } else {
        if (response.status === 409) {
          errorContainer.innerHTML = "User Already Exists";
          errorContainer.style.color = "red";
        } else {
          if (response.status === 500) {
            errorContainer.innerHTML = "Server Problems";
            errorContainer.style.color = "red";
          }
        }
      }
    });
  });
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Send the form data to the server using fetch or another AJAX method
    const response = await fetch("/userLogin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }).then((response) => {
      console.log(response);

      if (response.status === 200) {
        errorContainer2.innerHTML = "Successfully logged in";
        errorContainer2.style.color = "green";
      } else {
        if (response.status === 404) {
          errorContainer2.innerHTML = "Incorrect Password/Email";
          errorContainer2.style.color = "red";
        } else {
          if (response.status === 500) {
            errorContainer2.innerHTML = "Server Problems";
            errorContainer2.style.color = "red";
          }
        }
      }
    });
  });
});
