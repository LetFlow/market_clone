const calcTime = (timestamp) => {
  // 보낼때는 세계시간 기준으로 보내는데 받을때는 한국시간 기준으로 받게되므로 -9해서 세계시간에 맞춰준다
  const curTime = new Date().getTime();

  const time = new Date(curTime - timestamp - 9 * 60 * 60 * 1000);
  const hour = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  if (hour > 0) return `${hour}시간 전`;
  else if (minutes > 0) return `${minutes}분 전`;
  else if (seconds >= 0) return `${seconds}초 전`;
  else return "방금 전";
};

const rednerData = (data) => {
  const main = document.querySelector("main");
  data.reverse().forEach(async (obj) => {
    const div = document.createElement("div");
    div.className = "item-list";

    const imgDiv = document.createElement("div");
    imgDiv.className = "itme-list__img";

    const img = document.createElement("img");
    const res = await fetch(`/images/${obj.id}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    img.src = url;
    // img.src = obj.image;
    //img.src = "assets/image.svg";

    const InfoDiv = document.createElement("div");
    InfoDiv.className = "item-list__imfo";

    const InfoTitleDiv = document.createElement("div");
    InfoTitleDiv.className = "item-list__info-title";
    InfoTitleDiv.innerText = obj.title;

    const InfoMetaDiv = document.createElement("div");
    InfoMetaDiv.className = "item-list__info-meta";
    InfoMetaDiv.innerText = obj.place + " " + calcTime(obj.timeAt);

    const InfoPriceDiv = document.createElement("div");
    InfoPriceDiv.className = "item-list__info-price";
    InfoPriceDiv.innerText = obj.price;

    imgDiv.appendChild(img);

    InfoDiv.appendChild(InfoTitleDiv);
    InfoDiv.appendChild(InfoMetaDiv);
    InfoDiv.appendChild(InfoPriceDiv);

    div.appendChild(imgDiv);
    div.appendChild(InfoDiv);

    main.appendChild(div);
  });
};

const fetchList = async () => {
  const res = await fetch("/items");
  const data = await res.json();
  rednerData(data);
};

fetchList();
