import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CommonsApiResponse {
  query: {
    pages: {
      [key: string]: {
        imageinfo: Array<{
          extmetadata: {
            Artist: { value: string };
            License: { value: string };
            LicenseUrl: { value: string };
            LicenseShortName: {value: string};
          }
        }>
      }
    }
  }
}

export interface ImageMeta {
  author: string;
  license: string;
  licenseUrl: string;
  licenseShortName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonsService {

  private apiUrl = 'https://commons.wikimedia.org/w/api.php';

  constructor(private http: HttpClient) {}

  fetchImageMeta(fileName: string): Observable<ImageMeta> {
    const params = {
      action: 'query',
      titles: `File:${fileName}`,
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      format: 'json',
      origin: '*'  // wichtig für CORS
    };

    return this.http.get<CommonsApiResponse>(this.apiUrl, { params })
      .pipe(
        map(res => {
          const pages = res.query.pages;
          const page = Object.values(pages)[0];

          if (!page?.imageinfo?.length) {
            throw new Error('Keine Bildinfos gefunden');
          }

          const meta = page.imageinfo[0].extmetadata;
          console.log(meta);
          return {
            author: meta.Artist?.value ?? 'unbekannt',
            license: meta.License?.value ?? 'unbekannt',
            licenseUrl: meta.LicenseUrl?.value ?? '',
            licenseShortName: meta.LicenseShortName?.value ?? '',
          };
        })
      );
  }
}
