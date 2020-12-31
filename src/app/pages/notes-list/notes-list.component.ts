import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Note } from 'src/app/shared/note.class';
import { NotesService } from 'src/app/shared/services/notes.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations: [
    trigger('itemAnim', [
      // Entry animation
      transition('void => *', [
        //  Initial state
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,

          // we have to 'expand' out the padding properties
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0
        }),
        // we first want to animate the spacing (which includes height and margin)
        animate('50ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*'
        })),
        animate(80)
      ]),

      // delete element from dom
      transition('* => void', [
        // first scale up
        animate(50, style({
          transform: 'scale(1.05'
        })),
        // then scale down back to normal size while beginning to fade out
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        // scale dawn and fade out completely
        animate('120ms ease-out', style({
          transform: 'scale(0.68',
          opacity: 0,
        })),
        // then animate the spacing (which includes height and margin)
        animate('150ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          'margin-bottom': '0'
        }))
      ])
    ]),

    trigger('listAnim', [
      transition('* => *', [
        query(':enter' , [
          style({
            opacity: 0,
            height: 0
          }),
          stagger(100, [
            animate('0.2s ease')
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class NotesListComponent implements OnInit {
  @ViewChild('filterInput') filterInputRef: ElementRef<HTMLInputElement>;
  notes: Note[] = new Array<Note>();
  filteredNotes: Note[] = new Array<Note>();

  constructor(
    private notesService: NotesService
  ) { }

  ngOnInit(): void {
    // We want to retrieve all notes from NotesService
    this.notes = this.notesService.getAll();
    // this.filteredNotes = this.notesService.getAll();
    this.filter('');
  }

  deleteNote(note: Note) {
    const noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputRef.nativeElement.value);
  }

  generateNoteURL(note: Note) {
    const noteId = this.notesService.getId(note);
    return noteId;
  }

  // tslint:disable-next-line: no-shadowed-variable
  filter(query: string) {
    query = query.toLowerCase().trim();
    let allResults: Note[] = new Array<Note>();

    // split up the search query into individual words
    let terms: string[] = query.split(' '); // split on spaces
    // remove duplicate search terms
    terms = this.removeDuplicates(terms);
    // compile all relevant results into the allResults array
    terms.forEach(term => {
      const results: Note[] = this.relevantNotes(term);
      // append results to the allResults array
      allResults = [...allResults, ...results];
    });

    // allResults will include duplicate notes
    // because a particular note can be the result of many search terms
    // but we don't want to show the same note multiple times on the UI
    // so we first must remove the duplicates
    const uniqueResults = this.removeDuplicates(allResults);
    this.filteredNotes = uniqueResults;

    // now sort by relevancy
    this.sortByRelevancy(allResults);
  }

  removeDuplicates(arr: Array<any>): Array<any> {
    const uniqueResults: Set<any> = new Set<any>();
    // loop through the input array and add the items to the set
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);
  }

  // tslint:disable-next-line: no-shadowed-variable
  relevantNotes(query: string): Array<Note> {
    query.toLowerCase().trim();
    const relevantNotes = this.notes.filter(note => {
      if (note.title && note.title.toLowerCase().includes(query)) {
        return true;
      }
      if (note.body && note.body.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });

    return relevantNotes;
  }

  sortByRelevancy(searchResults: Note[]) {
    // This method will calculate the relevancy of a note based on the number of times it appears in the search results
    const noteCountObj = {}; // format - key:value => NoteId:number (note object id : count)

    searchResults.forEach(note => {
      const noteId = this.notesService.getId(note); // get the notes id

      if (noteCountObj[noteId]) {
        noteCountObj[noteId] += 1;
      } else {
        noteCountObj[noteId] = 1;
      }
    });

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      const aId = this.notesService.getId(a);
      const bId = this.notesService.getId(b);

      const aCount = noteCountObj[aId];
      const bCount = noteCountObj[bId];

      return bCount - aCount;
    });
  }

}
