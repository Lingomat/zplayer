import { Component, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core'
import { FirebaseProvider, SmallRecipeHit, Language } from '../../providers/firebase/firebase'
import { } from 'googlemaps'

declare var google
declare var MarkerClusterer // has been hacked in by page script source... sigh.

@Component({
  selector: 'google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapComponent {
  @ViewChild('map') mapElement: ElementRef
  @Output() selected = new EventEmitter<{selected: SmallRecipeHit, evt: MouseEvent}>()
  geoFire: any
  geoQuery: any
  position: {latitude: number, longitude: number}
  apiKey: string = 'AIzaSyB4OZ8FSXmj33l2f_UqDaJMcDiA-ZXpKBk'
  loadingSdk: boolean = false
  mapInitialised: boolean = false
  map: google.maps.Map
  markers: Map<string, google.maps.Marker> = new Map()
  mlist: google.maps.Marker[] = []
  initialZoomLevel: number = 15
  mc: any
  infoContent: string = '<h2>A thing!</h2><p>With details and stuff</p>'
  infoWindow: google.maps.InfoWindow
  recipeCache: Map<string, SmallRecipeHit> = new Map()
  mouseEvent: MouseEvent
  /*
    C O N S T R U C T O R
  */
  constructor(
    public fb: FirebaseProvider
  ) {
    this.geoFire = this.fb.getGeoType('recipe')
  }

  ngOnInit() {
    console.log('on init')
    this.loadGoogleMaps()
  }
  
  initGeoFire(pos: [number, number]) {
    const addRecipe = (recipeId: string, latitude: number, longitude: number) => {
      if (!this.markers.has(recipeId)) {
        let marker: google.maps.Marker = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          icon: './assets/img/map-marker3.png'
          //map: this.map
        })
        marker.addListener('click', (evt: google.maps.MouseEvent) => {
          console.log('marker listen')
          if (this.recipeCache.has(recipeId)) {
            let hit = this.recipeCache.get(recipeId)
            this.selected.emit({selected: hit, evt: this.mouseEvent}) // use stashed mouse event
          } else {
            this.fb.fetchRecipeHit(recipeId)
            .then(rs => {
              if (rs) {
                this.recipeCache.set(recipeId, rs)
                this.selected.emit({selected: rs, evt: this.mouseEvent})
              }
            })
          }
        })
        this.markers.set(recipeId, marker)
        this.mc.addMarker(marker)
      }
    }
    const removeRecipe = (recipeId: string) => {
      if (this.markers.has(recipeId)) {
        let m = this.markers.get(recipeId)
        //m.setMap(null)
        this.mc.removeMarker(m)
        this.markers.delete(recipeId)
      }
    }
    const getRadius = (): number => {
      // something to get the current radius
      return 10
    }
    this.geoQuery = this.geoFire.query({
      center: pos,
      radius: getRadius()
    })
    this.geoQuery.on("key_entered", (key, location, distance) => {
      console.log('map:', key + " entered query at " + location + " (" + distance + " km from center)")
      let decodeid = key.replace(/-/g, '/')
      addRecipe(decodeid, location[0], location[1])
    })
    this.geoQuery.on("key_exited", (key, location, distance) => {
      console.log('map:', key + " exited query at " + location + " (" + distance + " km from center)")
      let decodeid = key.replace(/-/g, '/')
      removeRecipe(decodeid)
    })
  }

  getNavigatorPos(): Promise<{longitude: number, latitude: number}> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((pos) => {
        resolve({
          longitude: pos.coords.longitude, 
          latitude: pos.coords.latitude
        })
      }, (error) => {
        reject(error)
      })
    })
  }

  // this is the sort of shite you do because people like Google wont publish their code on npm
  // thus creating spawning stuff like Open Layers.
  loadGoogleMaps() {
    if (typeof google == "undefined" || typeof google.maps == "undefined") {
      this.loadingSdk = true
      console.log("googlemap: Loading JavaScript for Google maps.")
       //Load the SDK
      window['mapInit'] = () => {
        this.initMap()
      }
      let script = document.createElement("script")
      script.id = "googleMaps"
      if (this.apiKey) {
        script.src = 'https://maps.google.com/maps/api/js?key=' + this.apiKey + '&callback=mapInit&libraries=geometry'
      } else {
        script.src = 'https://maps.google.com/maps/api/js?callback=mapInit&libraries=geometry'
      }
      let [thisLanguage, thisRegion] = window.navigator.language.split('-')
      script.src += '&language=' + thisLanguage + '&region=' + thisRegion
      document.body.appendChild(script)
    } else {
      this.initMap()
    }
  }

  async initMap() {
    console.log('initMap')
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      var p = 0.017453292519943295    // Math.PI / 180
      var c = Math.cos
      var a = 0.5 - c((lat2 - lat1) * p) / 2 + 
              c(lat1 * p) * c(lat2 * p) * 
              (1 - c((lon2 - lon1) * p)) / 2
      return 12742 * Math.asin(Math.sqrt(a)) 
    }
    const updateGeoFire = () => {
      let bounds: google.maps.LatLngBounds = this.map.getBounds()
      let dst: number = calcDistance(
        bounds.getNorthEast().lat(), 
        bounds.getNorthEast().lng(),
        bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng()
      )
      this.geoQuery.updateCriteria({
        center: [bounds.getCenter().lat(), bounds.getCenter().lng()],
        radius: dst / 2
      })
    }
    this.mapInitialised = true
    this.infoWindow = new google.maps.InfoWindow({
      content: this.infoContent
    })
    console.log('getting pos')
    try {
      this.position = await this.getNavigatorPos()
    } catch(e) {
      console.log('map: error in getNavigatorPos()', e)
    }
    console.log('got pos')
    if (this.position) {
      console.log('current pos', this.position)
      let latLng: google.maps.LatLng = new google.maps.LatLng(this.position.latitude, this.position.longitude)
      let mapOptions: google.maps.MapOptions = {
        center: latLng,
        zoom: this.initialZoomLevel,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions)
      this.map.addListener('idle', () => {
        console.log('idle fired')
        updateGeoFire()
      })
      // stash DOM clicks on map because Google Maps API amazingly provides
      // no way to get a real MouseEvent
      this.mapElement.nativeElement.addEventListener('click', (evt) => {
        console.log('dom listen')
        this.mouseEvent = evt
      }, true)
      this.map.addListener('click', (evt) => {
        this.infoWindow.close()
      })
      this.mc = new MarkerClusterer(this.map)
      console.log('init geofire')
      this.initGeoFire([this.position.latitude,this.position.longitude])
    }
  }
}