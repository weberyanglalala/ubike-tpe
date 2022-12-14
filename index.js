let dataArray;
const UBIKE_TAIPEI =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
window.onload = async function () {
  dataArray = await getDataFromUrl(UBIKE_TAIPEI);
};
async function getDataFromUrl(url) {
  try {
    let res = await fetch(url);
    return res.json();
  } catch (error) {
    console.log(error, "cannot fetch data from api");
  }
}
