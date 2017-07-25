import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  tree : any = [
    {title: '1'},
    {title: '2', children: [
      {title: '2.1'}
    ]}
  ]
}

// https://stackoverflow.com/questions/38130705/set-component-style-from-variable-in-angular-2
// https://stackoverflow.com/questions/41109500/angular2-recursive-html-without-making-a-new-component
