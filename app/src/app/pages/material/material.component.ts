import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/core/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { Material, Entity } from 'src/app/shared/models/models';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss'],
})
export class MaterialComponent implements OnInit {
  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  /** hook that is executed at component initialization */
  ngOnInit() {
    /** Extract the id of entity from URL params. */
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      const materialId = params.get('materialId');
      /** Use data service to fetch entity from database */
      this.dataService
        .findById(materialId)
        .then((entity) => {
          this.material = entity as Material;
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /** The entity this page is about */
  material: Material = null;

  sliderItems: Entity[] = [
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/a/a2/Stube_im_Sonnenlicht_-_Carl_Knauf.jpg',
      label: 'Living Room in Sunlight',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/e/e0/Georges_Kars%2C_Mu%C5%BE_s_ko%C5%88mi_%28Or%C3%A1n%C3%AD%29.jpg',
      label: 'Man with Horses (Ploughing)',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/The_Crucifixion_MET_DP164823.jpg',
      label: 'The Crucifixion',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/f/fb/Le_Bosphore_F%C3%A9lix_Ziem.jpg',
      label: 'The Bosphorus',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Van_Emelen%2C_Adrien_Henri_Vital_-_Negro_com_Chap%C3%A9u_e_Cachimbo.jpg',
      label: 'Negro com Chapeu e Cachimbo',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Van_Emelen%2C_Adrien_Henri_Vital_-_%C3%8Dndio_de_Perfil.jpg',
      label: 'Ãndio de Perfil',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Van_Emelen%2C_Adrien_Henri_Vital_-_Negrinho_sob_uma_torneira.jpg',
      label: 'Negrinho sob uma torneira',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/e/ed/Vilho_Lampi_-_Self-Portrait.jpg',
      label: 'Self-Portrait',
    },
    {
      id: '',
      description: '',
      type: '',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/687px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
      label: 'Mona Lisa',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Makowski_Pineapple_on_a_plate.jpg',
      label: 'Pineapple on a plate',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Van_Emelen%2C_Adrien_Henri_Vital_-_Dois_Negrinhos_com_Chap%C3%A9u.jpg',
      label: 'Dois Negrinhos com ChapÃ©u',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Henri_Beau_-_autoportrait.JPG',
      label: 'Self-Portrait',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/65/The_Flagellation_MET_DP164873.jpg',
      label: 'The Flagellation',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Karol_Hiller_-_Deska_0_%2C_Kompozycja_0_-_Google_Art_Project.jpg',
      label: 'Deska 0 / Kompozycja 0',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Van_Emelen%2C_Adrien_Henri_Vital_-_Negro_com_Chap%C3%A9u.jpg',
      label: 'Negro com ChapÃ©u',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Henry_Ossawa_Tanner_-_Gateway%2C_Tangier_%28Smithsonian_American_Art_Museum%29.jpg',
      label: 'Gateway, Tangier',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Van_Emelen%2C_Adrien_Henri_Vital_-_Homem_com_Chap%C3%A9u%2C_Camisa_Branca.jpg',
      label: 'Homem com ChapÃ©u, Camisa Branca',
    },
    {
      id: '',
      description: '',
      type: '',
      image: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Van_Emelen%2C_Adrien_Henri_Vital_-_Negro_com_Chap%C3%A9u_Tocando_Viol%C3%A3o.jpg',
      label: 'Negro com ChapÃ©u Tocando ViolÃ£o',
    },
  ];
}
