import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'germanCurr'
})

export class GermanCurrencyPipe implements PipeTransform {

  transform(value: any, curr: any) {

    if(value) {
      return value.toString().replace('.', ',');
    }

    return false;
  }
}
