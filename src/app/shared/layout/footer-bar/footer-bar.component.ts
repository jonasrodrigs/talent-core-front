import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-bar',
  standalone: true,
  template: `<small>&copy; {{year}} Talent Core</small>`
})
export class FooterBarComponent {
  year = new Date().getFullYear();
}