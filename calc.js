import LatLon from 'https://cdn.jsdelivr.net/npm/geodesy@2.2.1/latlon-spherical.min.js';

export class CalcVR {
    constructor() {
        this.distance = 0;
        this.bearing = 0;
        this.newPosition = [0, 0];
        this.currentPosition = [0, 0];
        this.objectSize = '0, 0, 0';
        this.newDistance = 800;
    }
    // 距離と方角を計算
    calcDist(currentPosiArg, targetPosition) {
        const current = new LatLon(currentPosiArg[0], currentPosiArg[1]);
        const target = new LatLon(targetPosition[0], targetPosition[1]);
        this.distance = current.distanceTo(target);
        this.bearing = current.finalBearingTo(target)
        this.currentPosition = currentPosiArg;
    }
    //表示位置を計算
    calcNewPosition(currentPosition, bearing, newTargetToDistance) {
        const current = new LatLon(currentPosition[0], currentPosition[1]);
        const calculatedlced = current.destinationPoint(newTargetToDistance, bearing);
        this.newPosition = [calculatedlced.latitude, calculatedlced.longitude];
    }
    // サイズを計算
    calcSizeDist(distance) {
        if(distance <= 1000 && distance >= 500){
//            this.objectSize = '25 25 25';
            this.objectSize = '2.5 2.5 2.5';
            this.newDistance = 800;
        }else if(distance > 1000 && distance <= 8000) {
//            this.objectSize = '20 20 20';
            this.objectSize = '2.0 2.0 2.0';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 8000 && distance <= 16000) {
//            this.objectSize = '18 18 18';
            this.objectSize = '1.8 1.8 1.8';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 16000 && distance <= 20000) {
//            this.objectSize = '15 15 15';
            this.objectSize = '1.5 1.5 1.5';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 20000) {
//            this.objectSize = '10 10 10';
            this.objectSize = '1 1 1';
            this.newDistance = 800 + (distance/1000);
        }
    }

}
window.onload = () => {
    navigator.geolocation.getCurrentPosition(success, error, options);
};

// 目的地情報を追加。19個くらいまでは大丈夫そう。
function staticLoadPlaces() {
    return [
        {
            name: 'Time Desk',
            modelName: 'https://shimizukobo.github.io/ship01x8uj5h/assets/ship.glb',
            location: {
                lat: 32.94250911123393,
                lng: 132.56701256189322,
            }
        },

    ];
}

// 描画するため、a-sceneに追加。
function renderPlaces(places, pos) {
    let scene = document.querySelector('a-scene');
    var crd = pos.coords;
    let cal = new CalcVR();

    //GeolocationAPが利用できるか確認
/*    if (navigator.geolocation) {
      test(elevation)
    } else {
      alert("現在地を取得できませんでした。")
    }
*/
    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        let name = place.name;
        let modelName = place.modelName;
        cal.calcDist([crd.latitude, crd.longitude], [latitude, longitude]);
        cal.calcNewPosition(cal.currentPosition, cal.bearing, cal.newDistance);
        cal.calcSizeDist(cal.distance);
        let model = document.createElement('a-entity');
        model.setAttribute('look-at', '[gps-camera]');
        model.setAttribute('gps-entity-place', `latitude: ${cal.newPosition[0]}; longitude: ${cal.newPosition[1]};`);
        model.setAttribute('gltf-model', `${modelName}`);
        model.setAttribute('animation-mixer', '');
        model.setAttribute('scale', `${cal.objectSize}`);
        model.setAttribute('position', '0 -${elevation} 0');
        model.setAttribute('position', '0 -${elevation} 0');
        model.setAttribute('rotation', '0 0 180');

        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        scene.appendChild(model);
    });
}

/*
// 目的地情報を追加。19個くらいまでは大丈夫そう。
function staticLoadPlaces() {
    return [
        {
            name: 'Time Desk',
            location: {
                lat: 32.94250911123393,
                lng: 132.56701256189322,
            }
        },

    ];
}
// 描画
function renderPlaces(places, pos) {
    let scene = document.querySelector('a-scene');
    var crd = pos.coords;
    let cal = new CalcVR();

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        cal.calcDist([crd.latitude, crd.longitude], [latitude, longitude]);
        cal.calcNewPosition(cal.currentPosition, cal.bearing, cal.newDistance);
        cal.calcSizeDist(cal.distance);
        let model = document.createElement('a-box');
        model.setAttribute('material', 'color: red');
        model.setAttribute('gps-entity-place', `latitude: ${cal.newPosition[0]}; longitude: ${cal.newPosition[1]};`);
        model.setAttribute('scale', `${cal.objectSize}`);

        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
        });

        scene.appendChild(model);
    });
}
*/

var options = {
    enableHighAccuracy: true,
    timeout: 50000,
    maximumAge: 0
  };
  
function success(pos) {
    let places = staticLoadPlaces();
    renderPlaces(places, pos);
}
  
function error(err) {
   console.warn(`ERROR(${err.code}): ${err.message}`);
   alert('Unable to capture current location.');
 }


function test(elevation) {
    test2(position,elevation);
    navigator.geolocation.getCurrentPosition(position);
}

function test2(position,elevation) {

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
//      alert("現在地の標高は" + jsonAltitude.elevation + "mです。" +  "(" + "緯度：" + stringLat + "、経度：" + stringLon + ")")

    });

}    
