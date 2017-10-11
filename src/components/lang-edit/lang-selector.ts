import { Input, EventEmitter, Output, Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core'
import { Language } from '../../app/types'
import { Subscription } from 'rxjs/Subscription'
import { DataProvider } from '../../providers/data/data'

export interface LanguageResult {
  id: string
  name: string
  iso?: string
  recipes: string[]
}

@Component({
  selector: 'lang-selector',
  templateUrl: 'lang-selector.html'
})
export class LangSelectorComponent implements OnInit, OnDestroy {
  @Input() color: string = 'favorite'
  @Input() selectmode: string = 'search'
  @Input() selectedColor: string = 'primary'
  @Input() unSelectedColor: string = 'background'
  @Input() required: boolean = true
  @Input() languages: LanguageResult[] = []
  @Output() langsUpdated: EventEmitter<any> = new EventEmitter()
  @Output() langsAccept: EventEmitter<any> = new EventEmitter()
  lquery: string = ''
  existingISOs: string[] = [] // for fast elimination of existing db entries from autocomplete ISO hits
  autocompleteExistingIds: string[] = []
  selectedLanguageList: LanguageResult[]  // for a selected language line
  // Only in Select Mode
  autocompleteISOIndices: number[] = [] // don't have any IDs for these, so use index for isocodes array
  ISOSelectedIndices: number[] = []
  customSelected: string[] = []
  isocodes: any[] // ONLY EXISTS IN SELECT MODE
  // new
  nearbyLanguages: Language[] = []
  selectedLanguages: any[] = []
  allLangData: Map<string, {language: Language, usedIn: Set<string>}>
  nearbyLangData: Map<string, {language: Language, usedIn: Set<string>}>
  dataSub: Subscription
  large: string[] = ["cmn","spa","eng","hin","ara","por","ben","rus",
   "jpn","pan","jav","wuu","ind","tel","vie","kor","fra","mar",
    "tam","urd"]
  largeISOIndices: number[] = []
  constructor(
    public ref: ChangeDetectorRef, public dataService: DataProvider) {
  }
  
  ngOnInit() {
    if (this.selectmode === 'select') {
      this.dataService.getISOLanguages().then((isolangs) => {
        this.isocodes = isolangs
      })
    }
    this.selectedLanguages = this.languages
    // this.dataSub = this.sync.getObservableData().subscribe((observableData) => {
    //   this.allLangData = observableData.all.languages
    //   this.nearbyLangData = observableData.nearby.languages
    //   this.initialize()
    // })
  }
  
  ngOnDestroy() {
    if (this.dataSub) {
      this.dataSub.unsubscribe()
    }
  }

  initialize() {
    // reset these in case the observable fires again
    this.existingISOs = []
    this.nearbyLanguages = []
    this.clearResults()
    for (let entry of Array.from(this.nearbyLangData.values())) {
      if (entry.language.iso) {
        this.existingISOs.push(entry.language.iso)
      }
    }
    for (let nl of Array.from(this.nearbyLangData.values())) {
      if (!this.isSelected(nl.language.name)) {
        this.nearbyLanguages.push(nl.language)
      }
    }
    this.ref.detectChanges()
  }
  
  // Only show the custom tag if we have a typed query
  // and we're in language select mode (as opposed to search)
  showCustomLanguage() {
    return this.lquery && this.lquery.length && this.selectmode === 'select'
  }

  isSelected(name: string): boolean {
    return (this.selectedLanguages.findIndex(x => {
      return x.name === name
    }) !== -1)
  }

  filterChoices() {
    if (this.lquery.length > 2) {
      let lq = this.lquery.toLowerCase()
      this.autocompleteExistingIds = Array.from(this.nearbyLangData.keys()).filter((id) => {
        let thisLang = this.nearbyLangData.get(id).language
        let sfind = thisLang.name + ' '
        sfind += thisLang.iso ? (' ' + thisLang.iso) : ''
        return sfind.toLowerCase().indexOf(lq) > -1
      })
      if (this.selectmode === 'select') {
        this.autocompleteISOIndices = []
        this.largeISOIndices = []
        for (let i = 0; i < this.isocodes.length; ++i) {
          if (this.existingISOs.indexOf(this.isocodes[i].i) === -1) {
            let sfind = this.isocodes[i].n + ' ' + this.isocodes[i].i
            if (sfind.toLowerCase().indexOf(lq) > -1) {
              if (this.isLarge(this.isocodes[i].i)) {
                this.largeISOIndices.push(i)
              } else {
                this.autocompleteISOIndices.push(i)
              }
            }
          }
        }
        if (this.autocompleteISOIndices.length > 12) {
          this.autocompleteISOIndices.length = 12
        }
        this.ref.detectChanges()
      }
    } else {
      this.autocompleteExistingIds = []
      this.autocompleteISOIndices = []
      this.largeISOIndices = []
    }
  }

  // Just move the nearby language to the selected array
  selectNearbyLanguage(lang: any) {
    this.selectedLanguages.push(lang)
    this.emitOutput()
    this.ref.detectChanges()
  }
  selectAutocompleteLanguage(id: string) {
    this.selectedLanguages.push(this.nearbyLangData.get(id).language)
    this.emitOutput()
    this._clearInput()
    this.ref.detectChanges()
  }
  selectAutocompleteISOLanguage(index: number) {
    this.selectedLanguages.push({
      name: this.isocodes[index].n,
      iso: this.isocodes[index].i
    })
    this.emitOutput()
    this._clearInput()
    this.ref.detectChanges()
  }
  _clearInput() {
    this.autocompleteExistingIds = []
    this.autocompleteISOIndices = []
    this.largeISOIndices = []
    this.lquery = ''
  }
  unselectISOLanguage(index: number): void {
    let langIdx = this.ISOSelectedIndices.splice(index,1)[0]
    this.autocompleteISOIndices.push(langIdx)
    this.ref.detectChanges()
  }

  // If we touched on a selected language, we need to put it back where it came from
  unselectSelectedLanguage(index: number) {
    this.selectedLanguages.splice(index, 1)[0]
    this.emitOutput()
    this.ref.detectChanges()
  }

  selectCustomLanguage() {
    if (!this.canAddCustom()) {
      return
    }
    let tquery = this.lquery.trim()
    this.selectedLanguages.push({
      name: tquery
    })
    this.clearResults()
  }

  clearResults() {
    this.lquery = ''
    this.autocompleteExistingIds = []
    this.autocompleteISOIndices = []
    this.largeISOIndices = []
  }

  unSelectCustomLanguage(index: number) {
    this.customSelected.splice(index, 1)
    this.ref.detectChanges()
  }

  canAccept(): boolean {
    return (!this.required ||
      (this.required && this.selectedLanguages.length > 0))
  }
  
  // Avoid dupes of custom languages by disallowing clicking on add custom
  // when there is already an existing 
  canAddCustom(): boolean {
    let tquery = this.lquery.trim()
    if (tquery.length < 2) {
      return false
    }
    for (let lang of Array.from(this.nearbyLangData.values())) {
      if (lang.language.name.toLowerCase() ===
        tquery.toLowerCase()) {
        return false
      }
    }
    for (let iso of this.isocodes) {
      if (iso.n.toLowerCase() === tquery.toLowerCase()) {
        return false
      }
    }
    return true
  }

  emitOutput() {
    let emitData: LanguageResult[] = [] // how the hell are you supposed to type emitted events?!
    for (let lang of this.selectedLanguages) {
      let tl = Object.assign({}, lang)
      if (!('recipes' in tl)) {
        let findLang = Array.from(this.allLangData.values()).find((l) => {
          return l.language.name === lang.name
        })
        tl.recipes = findLang ? Array.from(findLang.usedIn) : []
      }
      emitData.push(tl) 
    }
    this.langsUpdated.emit({languages: emitData})
    
    //console.log('lang sel: emit', emitData)
  }

  makeLangChipName(lang: any): string {
    let output = lang.name
    if (lang.iso) {
      output += ' (' + lang.iso + ')'
    }
    return output
  }

  showNearby(): boolean {
    if (this.selectmode !== 'select') {
      return false
    }
    let showing = this.nearbyLanguages.findIndex((l) => {
      return !this.isSelected(l.name)
    })
    return (this.nearbyLanguages.length && showing !== -1)
  }

  acceptLanguages() {
    //console.log('emitting', this.selectedLanguages)
    this.langsAccept.emit({
      languages: this.selectedLanguages
    })
  }

  isLarge(iso: string): boolean {
    return this.large.indexOf(iso) !== -1
  }
}
