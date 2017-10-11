import { SafeStyle } from '@angular/platform-browser'

export interface RecipeAssets {
  recipeData: Recipe
  audio: Blob
  slides: Slide[]
}

// a slide will always have an image, imageId and bg SafeStyle
// but it may optionally also have video if the type is 'video'
export interface Slide {
  imageId: string,
  type: string,
  bg: SafeStyle
  image?: Blob,
  video?: Blob
  videoId?: string
}

export interface Recipe {
  _id: string
  created: number
  author: string
  authorUsername: string
  audio: string
  gestures: Gesture[]
  displayImage: number
  description: string
  duration: number
  location: Geoloc
  mediaSet: MediaFrame[]
  name: string
  stage: number
  tags: string[]
  languages: Language[]
  timeLine: TimeLine
  valid: boolean
  shared: boolean
  deleted: boolean
  handle: string
}

export interface Geoloc {
  latitude: number
  longitude: number
}


export interface MediaFrame {
  type: string
  image: string
  video?: string
}

export interface Gesture {
  timeOffset: number
  type?: string
  timeLine: {x: number, y: number, t: number}[]
}

export interface Language {
  iso?: string
  name: string
}

export interface Translation {
  _id?: string
  languages: Language[]
  author: string
  audioFileId: string
  description: string
  handle: string
  created: number
  timeLine: RespeakTimeLine
  audio?: Blob
}

export interface PublicUserData {
  userName: string
  photoURL: string
  location: string
  joined: number
}

export interface TimeLine extends Array<{t: number}>{}

export interface RespeakTimeLine extends Array<{source: {start: number, end: number}, secondary: {start: number, end: number}}>{}
