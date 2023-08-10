const form = document.querySelector("#login-form");

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const sha256pswd = sha256(formData.get("password"));
  formData.set("password", sha256pswd);

  const res = await fetch("/login", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (res.status === 200) {
    alert("로그인에 성공했습니다.");
    window.location.pathname = "/";
  } else if (res.status === 401) {
    alert("아이디 혹은 비밀번호가 틀렸습니다.");
  }
};

form.addEventListener("submit", handleSubmit);
