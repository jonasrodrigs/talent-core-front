import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

// Ajuste os caminhos destes 3 imports conforme sua árvore:
import { HeaderToolbarComponent } from '@shared/layout/header-toolbar/header-toolbar.component';
import { SideNavComponent } from '@shared/layout/side-nav/side-nav.component';
import { FooterBarComponent } from '@shared/layout/footer-bar/footer-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderToolbarComponent,
    SideNavComponent,
    FooterBarComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}