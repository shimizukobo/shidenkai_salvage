//GeolocationAPが利用できるか確認
if (navigator.geolocation) {
  test()
} else {
  alert("現在地を取得できませんでした。")
}


function test() {
    navigator.geolocation.getCurrentPosition(test2);
}

function test2(position) {

    //まず現在地の緯度経度を取得する
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    //国土地理院API用に有効桁数を合わせる。
    var adjustiveLat = lat + "00";
    var adjustiveLon = lon + "0";

    //文字列に変換
    var stringLat = String(adjustiveLat);
    var stringLon = String(adjustiveLon);

    //国土地理院APIに現在地の緯度経度を渡して、標高を取得する
    const url = 'http://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=' + stringLon + '&lat=' + stringLat + '&outtype=JSON';

//    console.log(url);

    fetch(url).then(function(response) {
      return response.text();
    }).then(function(text) {
//      console.log(text);
      
      //取得したjsonをパース
      var jsonAltitude = JSON.parse(text);
//      console.log("標高：" + jsonAltitude.elevation + "m");

      //ポップアップ表示
      //alert("現在地の標高は" + jsonAltitude.elevation + "mです。" +  "(" + "緯度：" + stringLat + "、経度：" + stringLon + ")")

    });

}
