import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
    })
  }

  obterControle(nome: string) : FormControl {
    const control = this.formBusca.get(nome)
    if (!control) {
      throw new Error(`Form control com nome "${nome}" não existe.`)
    }
    return control as FormControl
  }

  openDialog() {
    this.dialog.open(ModalComponent, {
      width: '50%'
    })
  }
}
