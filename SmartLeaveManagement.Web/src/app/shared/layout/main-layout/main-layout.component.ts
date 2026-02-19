import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../../navbar/navbar.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="layout-container">
      <app-navbar (toggleSidebar)="sidenav.toggle()"></app-navbar>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened="true" class="sidenav">
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content class="content">
          <div class="p-4">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .sidenav-container {
      flex: 1;
    }
    .sidenav {
      width: 250px;
      border-right: 1px solid #e0e0e0;
    }
    .content {
      background-color: #f5f5f5;
      min-height: 100%;
    }
    .p-4 { padding: 1.5rem; }
  `]
})
export class MainLayoutComponent { }
