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
            this.objectSize = '25 25 25';
            this.newDistance = 800;
        }else if(distance > 1000 && distance <= 8000) {
            this.objectSize = '20 20 20';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 8000 && distance <= 16000) {
            this.objectSize = '18 18 18';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 16000 && distance <= 20000) {
            this.objectSize = '15 15 15';
            this.newDistance = 800 + (distance/1000);
        }else if(distance > 20000) {
            this.objectSize = '10 10 10';
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
            location: {
                lat: 32.96510687475258,
                lng: 132.58528236690506,
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

