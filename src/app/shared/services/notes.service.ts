import { Injectable } from '@angular/core';
import { Note } from '../note.class';

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  notes: Note[] = new Array<Note>();

  constructor() { }

  getAll() {
    this.notes = JSON.parse(localStorage.getItem('notes')) || new Array<Note>();
    return this.notes;
  }

  get(id: number) {
    return this.notes[id];
  }

  getId(note: Note) {
    return this.notes.indexOf(note);
  }

  add(note) {
    // this method will add a note to the notes array and return this id of the note
    // where the id = index
    const newLength = this.notes.push(note);
    localStorage.setItem('notes', JSON.stringify(this.notes));
    const index = newLength - 1;
    return index;
  }

  update(id: number, title: string, body: string) {
    const note = this.notes[id];
    note.title = title;
    note.body = body;
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  delete(id: number) {
    this.notes.splice(id, 1);
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}
