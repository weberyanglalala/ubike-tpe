// global variables
const districtSelect = document.querySelector("#district-select");
const resultPanel = document.querySelector("#result-panel");

let originalData;
let districtData;
let bikeAreaData;
let districtList;
const UBIKE_TAIPEI =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
const DISTRICT_INFO =
  "https://raw.githubusercontent.com/ChouJustice/ChouJustice.github.io/main/Map/%E5%8F%B0%E7%81%A3%E8%A1%8C%E6%94%BF%E5%9C%B0%E5%8D%80.json";

// initialize map
let map = L.map("map", {
  center: [25.03416068163684, 121.56454962636319],
  zoom: 12,
});

// set tileLayer
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  minZoom: 10,
  maxZoom: 19,
}).addTo(map);

// marker init
let markers = L.markerClusterGroup();

window.onload = async function () {
  Promise.all([getDataFromUrl(UBIKE_TAIPEI), getDataFromUrl(DISTRICT_INFO)])
    .then((res) => {
      originalData = res[0];
      districtData = res[1];
      setMarkers(originalData);
      setBikeAreaData(originalData);
      generateDistrictList();
    })
    .then(() => {
      districtSelect.addEventListener("change", handleDistrictDropdownChange);
    })
    .catch((err) => console.log("cannot get bike data"));
};

function getTravelRecommendation(e) {
  // todo
  console.log("get travel recommendation")
}

async function getDataFromUrl(url) {
  try {
    let res = await fetch(url);
    return res.json();
  } catch (error) {
    console.log(error, "cannot fetch data from api");
  }
}

function setMarkers(data) {
  if (markers) markers.clearLayers();
  for (let i = 0; i < data.length; i++) {
    let marker = L.marker([data[i].latitude, data[i].longitude]);
    if (data[i].act === "1") {
      data[i].icon = "fa-check";
    } else {
      data[i].icon = "fa-xmark";
    }

    marker.bindPopup(`
    <p>站名：${data[i].sna}</p>
    <p>位置：${data[i].ar}</p>
    <table class="table text-center table-striped">
      <thead>
        <tr>
          <th scope="col">狀態</th>
          <th scope="col">總數</th>
          <th scope="col">可租借</th>
          <th scope="col">空位</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row"><i class="fa-solid ${data[i].icon}"></i></th>
          <td>${data[i].total}</td>
          <td>${data[i].available_rent_bikes}</td>
          <td>${data[i].available_return_bikes}</td>
        </tr>
      </tbody>
    </table>
    `);
    markers.addLayer(marker);
  }
  markers.addTo(map);
}

function setBikeAreaData(data) {
  bikeAreaData = data.groupBy("sarea");
}

function generateDistrictList() {
  districtList = districtData.filter((x) => x.City === "臺北市");
  districtList.forEach((x) => {
    const opt = document.createElement("option");
    opt.value = x.District;
    opt.innerText = x.District;
    districtSelect.appendChild(opt);
  });
}

function renderResultPanel(districtName) {
  resultPanel.innerHTML = "";

  const stations = originalData.filter(
    (station) => station.sarea === districtName
  );

  if (stations.count === 0) {
    resultPanel.innerHTML = "查無此地區資料查無此地區資料";
    return;
  }

  stations.forEach((station) => {
    const stationTitle = station.sna.split("_")[1];
    const stationDetail = `<div class="card mb-3 p-3">
        <p class="text-dark station-name">站名：${stationTitle}</p>
        <p class="text-dark station-location">位置：${station.ar}</p>
        <table class="table text-center table-striped">
          <thead>
            <tr>
              <th scope="col">狀態</th>
              <th scope="col">總數</th>
              <th scope="col">可租借</th>
              <th scope="col">空位</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row"><i class="fa-solid ${station.icon}"></i></th>
              <td>${station.total}</td>
              <td>${station.available_rent_bikes}</td>
              <td>${station.available_rent_bikes}</td>
            </tr>
          </tbody>
        </table>
        <div class="btn-group" role="group">
          <button class="btn btn-primary" onclick="handleSetPosition(${station.latitude}, ${station.longitude})">前往地點</button>
          <button class="btn btn-secondary travel-recommendation-btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
            查詢旅遊推薦
          </button>
        </div>
      </div>`;
    const stationEl = document.createElement("div");
    stationEl.innerHTML = stationDetail;
    resultPanel.appendChild(stationEl);
  });
}

function handleSetPosition(lat, lng) {
  map.setView([lat, lng], 18);
}

function handleDistrictDropdownChange() {
  const result = districtData.find(
    (district) => district.District === this.value
  );
  map.setView([result.Lat, result.Lng], 15);
  renderResultPanel(this.value);
  document.querySelectorAll(".travel-recommendation-btn").forEach((btn) => {
    btn.addEventListener("click", getTravelRecommendation);
  });
}

// accumulator, currentValue
Array.prototype.groupBy = function (prop) {
  return this.reduce(function (groups, item) {
    const val = item[prop];
    groups[val] = groups[val] || [];
    groups[val].push(item);
    return groups;
  }, {});
};
