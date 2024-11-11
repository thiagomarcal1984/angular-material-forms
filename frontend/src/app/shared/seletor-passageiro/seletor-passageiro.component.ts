import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-seletor-passageiro',
  templateUrl: './seletor-passageiro.component.html',
  styleUrls: ['./seletor-passageiro.component.scss']
})
export class SeletorPassageiroComponent {
  @Input() titulo: string = 'Titulo'
  @Input() subtitulo: string = 'Subtitulo'
}
