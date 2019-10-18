import {Injectable} from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class Helpers {

  static parseTime(timeString: string) {
    const time = new Date(timeString).getTime();
    return moment(time).fromNow();
  }

  static scrollTo(elem, position) {
    const
      elemHeight = elem.offsetHeight,
      elemScrollHeight = elem.scrollHeight;

    if (position === 'bottom') {
      if ((elemScrollHeight - elemHeight) > 0) {
        elem.scrollTop = elemScrollHeight;
      }
    } else if (position === 'top') {
      elem.scrollTop = 10;
    } else if (+position) {
      elem.scrollTop = +position;
    }
  }


}
