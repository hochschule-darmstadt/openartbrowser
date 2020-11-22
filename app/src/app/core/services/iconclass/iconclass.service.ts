import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { iconclassEnvironment } from '../../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { Iconography } from '../../../shared/models/iconography.interface';
import 'rxjs/add/operator/map';
import { EntityIcon, EntityType } from '../../../shared/models/entity.interface';

@Injectable({
  providedIn: 'root'
})
export class IconclassService {
  constructor(private http: HttpClient) {}

  public getIconclassByNotation(notation: string): Observable<Iconography> {
    notation = encodeURI(notation);
    console.log(notation);
    const uri = iconclassEnvironment.apiURI + '/?notation=' + notation;
    console.log(uri);
    return this.http.get(uri).map((response: Array<any>) => {
      if (!response.length) {
        throw throwError(response);
      }
      const ico = {
        id: response[0].n,
        icon: EntityIcon.ICONOGRAPHY,
        type: EntityType.ICONOGRAPHY,
        children: response[0].c,
        parents: response[0].p,
        keywords: response[0].kw,
        text: response[0].txt
      } as Iconography;
      this.setIconographyLabel(ico);
      return ico;
    });
  }

  public setIconographyLabel(iconography: Iconography) {
    const regex = /[():;]/g; // TODO: find better regex?
    const match = regex.exec(iconography.text.de);
    if (match) {
      iconography.label = iconography.id + ': ' + iconography.text.de.substr(0, match.index);
    } else {
      iconography.label = iconography.id + ': ' + iconography.text.de;
    }
    return iconography;
  }
}
