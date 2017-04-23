import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputElement } from './input.element'
import { GridElement } from './grid.element'
import { JacobComponent } from '../preview/jacob.component';
import { JacobElementComponent } from '../preview/element.component';


@NgModule({
  entryComponents: [
    InputElement,
    GridElement
  ],
  declarations: [
    InputElement,
    GridElement,
    JacobComponent,
    JacobElementComponent
  ],
  exports: [
    JacobComponent,
    JacobElementComponent
  ],
  imports : [
    CommonModule
  ]
})
export class ElementModule { }

/*
import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';

@NgModule({})
export class DynamicModule {
  static withComponents(components: any[]) {
    return {
      ngModule: DynamicModule,
      providers: [
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          useValue: components,
          multi: true
        }
      ]
    }
  }
}
*/
