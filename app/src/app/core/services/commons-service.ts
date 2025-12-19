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
            Artist?: { value: string };                                         
            License?: { value: string };                                          
            LicenseUrl?: { value: string };                                         
            LicenseShortName?: { value: string };                                         
            Credit?: { value: string };                                         
            ObjectName?: { value: string };                                         
            DateTimeOriginal?: { value: string };                                         
            DateTime?: { value: string };                                         
            Categories?: { value: string };                                         
            Assessments?: { value: string };                                          
            ImageDescription?: { value: string };                                         
            UsageTerms?: { value: string };                                         
            Attribution?: { value: string };                                          
            AttributionRequired?: { value: string };                                          
            NonFree?: { value: string };                                          
            Restrictions?: { value: string };                                         
            Permission?: { value: string };                                         
            Copyrighted?: { value: string };                                          
            [key: string]: { value: string; source?: string; hidden?: string } | undefined;
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
      origin: '*'  // for CORS
    };

    return this.http.get<CommonsApiResponse>(this.apiUrl, { params })
      .pipe(
        map(res => {

          console.log(res);
          const pages = res.query.pages;
          const page = Object.values(pages)[0];

          if (!page?.imageinfo?.length) {
            throw new Error('No image info found');
          }

          const meta = page.imageinfo[0].extmetadata;
          console.log(meta);
          return {
            author: meta.Artist?.value ?? 'unknown',
            license: meta.License?.value ?? 'unknown',
            licenseUrl: meta.LicenseUrl?.value ?? '',
            licenseShortName: meta.LicenseShortName?.value ?? '',
          };
        })
      );
  }
}
