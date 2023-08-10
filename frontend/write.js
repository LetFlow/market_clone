const form = document.getElementById("write-form");

const handleSubmitForm = async (event) => {
  event.preventDefault();

  const body = new FormData(form);
  body.append("timeAt", new Date().getTime());

  try {
    const res = await fetch("/items", {
      method: "POST",
      body: body,
    });
    const data = await res.json();
    if (data === "200") window.location.pathname = "/";
    // 데이터를 잘 넘겨줬으면 다시 메인화면으로 돌아가도록 함
  } catch (e) {
    console.error(e);
  }
};

form.addEventListener("submit", handleSubmitForm);
