import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../types/user';

@Pipe({
  name: 'fullName'
})
export class FullNamePipe implements PipeTransform {

  public transform(user: User | undefined | null): string {
    if (!user) {
      return '';
    }
    let fullName = user.firstName ? user.firstName + ' ' : '';
    fullName += user.middleName ? user.middleName + ' ' : '';
    fullName += user.lastName ? user.lastName : '';
    fullName += user.suffix ? user.suffix : '';
    return fullName;
  }
}
