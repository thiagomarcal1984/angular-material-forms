import { DepoimentoService } from 'src/app/core/services/depoimento.service';
import { Component } from '@angular/core';
import { Depoimento } from 'src/app/core/types/type';

@Component({
  selector: 'app-depoimentos',
  templateUrl: './depoimentos.component.html',
  styleUrls: ['./depoimentos.component.scss']
})
export class DepoimentosComponent {
  depoimentos! : Depoimento[]
  constructor(
    private service : DepoimentoService,
  ) {
    // Outra forma é jogar estes comandos para ngOnInit()
    this.service.listar().subscribe(
      resposta => this.depoimentos = resposta
    )
  }
}
