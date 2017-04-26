import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ElementModule } from './elements/element.module';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { JacobPreviewComponent } from './preview/preview.component';
import { JacobPreviewOuterComponent } from './preview/preview-outer.component';

@NgModule({
  declarations: [
    AppComponent,
    JacobPreviewComponent,
	JacobPreviewOuterComponent
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
