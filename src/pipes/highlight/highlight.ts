import { PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
    constructor(public sanitizer: DomSanitizer) {
    }
    transform(text: string, search: string[]): SafeHtml {
        if (text && search) {
          for (let st of search) {
            let pattern = st.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
            pattern = pattern.split(' ').filter((t) => {
                return t.length > 0;
            }).join('|');
            const regex = new RegExp(pattern, 'gi');
            text = text.replace(regex, (match) => `<span class="highlight">${match}</span>`)
          }
          return this.sanitizer.bypassSecurityTrustHtml(text);
        } else {
            return text;
        }
    }
}
