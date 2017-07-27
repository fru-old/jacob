import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ElementModule } from './elements/element.module';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { DropletTreeNode } from './droplet-tree/angular/droplet-tree-node';
import { DropletTreeRoot, DropletTreeRootRows } from './droplet-tree/angular/droplet-tree-root';
import { DropletTreePreview } from './droplet-tree/angular/droplet-tree-preview';
import { DropletTreeInner } from './droplet-tree/angular/droplet-tree-inner';

@NgModule({
  declarations: [
    AppComponent,
    DropletTreeRoot,
    DropletTreeNode,
    DropletTreePreview,
    DropletTreeInner,
    DropletTreeRootRows
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ElementModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
