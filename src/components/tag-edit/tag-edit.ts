import { Input, EventEmitter, OnChanges, Output, Component } from '@angular/core'
import { PopoverController } from 'ionic-angular'

@Component({
  selector: 'tag-edit',
  templateUrl: 'tag-edit.html'
})
export class TagEditComponent implements OnChanges {
  @Input() tags: string[] = []
  @Input() readonly: boolean = false
  @Input() color: string = 'favorite'
  @Input() nohead: boolean = false
  @Output() tagsUpdated = new EventEmitter()
  selectedTags: string[] = []
  constructor(
      public popoverCtrl: PopoverController
  ) {}

  ngOnChanges(change) {
    if ('tags' in change && this.tags) {
      this.selectedTags = this.tags.slice()
    }
  }
  editTags() {
    if (this.readonly) {
      return
    }
    let popover = this.popoverCtrl.create('TagPopoverPage', {tags: this.selectedTags.slice(0)}, {cssClass: 'tag'})
    popover.onDidDismiss((data) => {
      if (data) {
        console.log('got', data.tags)
        this.tags = data.tags.slice(0)
        this.tagsUpdated.emit({tags: this.tags})
      }
    })
    popover.present()
  }

}
