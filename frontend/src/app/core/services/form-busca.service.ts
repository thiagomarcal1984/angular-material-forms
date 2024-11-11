import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor(
    private dialog: MatDialog,
  ) {
    this.formBusca = new FormGroup({
      // O parâmetro FormControl é o valor padrão do componente.
      somenteIda: new FormControl(false),
      origem: new FormControl(null),
      destino: new FormControl(null),
      tipo: new FormControl("Econômica"),
      adultos: new FormControl(1),
      criancas: new FormControl(0),
      bebes: new FormControl(0),
    })
  }

  obterControle(nome: string) : FormControl {
    const control = this.formBusca.get(nome)
    if (!control) {
      throw new Error(`Form control com nome "${nome}" não existe.`)
    }
    return control as FormControl
  }

  alterarTipo(evento: MatChipSelectionChange, tipo: string) {
    if (evento.selected) {
      this.formBusca.patchValue({tipo})
      console.log(`Tipo de passagem alterado para: ${this.formBusca.get('tipo')?.value}`)
    }
  }

  openDialog() {
    this.dialog.open(ModalComponent, {
      width: '50%'
    })
  }

  getDescricaoPassageiros() {
    let descricao = ''
    const controles = {'adultos' : 'adulto', 'criancas' : 'criança', 'bebes' : 'bebê'}
    Object.entries(controles).forEach(array_controle => {
      const nome_controle = array_controle[0]
      const label_controle = array_controle[1]
      const controle = this.formBusca.get(nome_controle)?.value
      if (controle && controle > 0) {
        descricao += `${controle} ${label_controle}${controle > 1 ? 's' : ''}, `
      }
    })
    descricao = descricao.substring(0, descricao.length -2)
    return descricao
  }
}
