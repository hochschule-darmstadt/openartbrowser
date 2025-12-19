import { Component, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CommonsService, ImageMeta } from '../../../core/services/commons-service';


@Component({
  selector: 'app-commons-info',
  imports: [CommonModule],
  templateUrl: './commons-info-component.html',
  styleUrl: './commons-info-component.scss',
  standalone: true,
})
export class CommonsInfoComponent implements OnInit {

  @Input() fileUrl: string = '';
  meta$!: Observable<ImageMeta>;
  error?: string;
  imageName?: string;
  authorText?: string;

  constructor(private commonsService: CommonsService) { }

  ngOnInit(): void {
    //this.fileUrl = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Horní_Skrýchov_-_výklenková_kaplička_(2).jpg';

    if (!this.fileUrl) {
      return;
    }
    this.imageName = decodeURIComponent(this.fileUrl.split('/').pop()!);
    this.meta$ = this.commonsService.fetchImageMeta(this.imageName);
    this.meta$.subscribe({
      next: (meta) => {
        const div = document.createElement('div');
        div.innerHTML = meta.author;
        this.authorText = div.innerText;
      },
      error: (err) => this.error = err.message,
    });
  }
}
