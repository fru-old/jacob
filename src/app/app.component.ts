import { Component, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  content = [{
    type: GridElement,
    elements: [
      {type: InputElement, _jacob: null},
      {type: InputElement, _jacob: null},
      {type: InputElement, _jacob: null}
    ]
  }];

  ngOnInit() {
    setInterval(() => { this.recalculateBoundingBoxes(this.content); }, 200);
  }

  recalculateBoundingBoxes (elements) {
    for ( let element of elements ) {
      if (element.elements) this.recalculateBoundingBoxes(element.elements);
      if (element._jacob) {
        element._jacob.box = element._jacob.element.getBoundingBox();
      }
    }
  }

  add() {
    this.content[0].elements.push({type: InputElement, _jacob: null});
  }

  switch(i,j) {
    var inputs = this.content[0].elements;
    var elI = inputs[i];
    var elJ = inputs[j];
    inputs[i] = elJ;
    inputs[j] = elI;

    elI._jacob.transition = { from: elI._jacob.box, time: 300, start: Date.now() };
    elJ._jacob.transition = { from: elJ._jacob.box, time: 300, start: Date.now() };
    var t1 = setInterval(() => { if(!this.recalculateTransitionAnimation(elI)) clearInterval(t1) }, 1);
    var t2 = setInterval(() => { if(!this.recalculateTransitionAnimation(elJ)) clearInterval(t2) }, 1);
  }

  recalculateTransitionAnimation(element) {
    if (!element._jacob) return;
    let box = element._jacob.box = element._jacob.element.getBoundingBox();
    let transition = element._jacob.transition;
    if (transition && transition.from && transition.start > Date.now() - transition.time) {
      let p =  (Date.now() - transition.start) / transition.time;
      element._jacob.offset = {
        x: (1-p) * (transition.from.x - box.x),
        y: (1-p) * (transition.from.y - box.y),
      };
      element._jacob.element.updateRelativePosition();
      return true;
    } else {
      element._jacob.transition = null;
      element._jacob.offset = null;
      element._jacob.element.updateRelativePosition();
      return false;
    }
  }



  print() {
    console.log(this.content);
  }
}
