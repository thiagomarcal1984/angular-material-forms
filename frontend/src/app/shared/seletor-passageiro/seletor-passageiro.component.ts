import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-seletor-passageiro',
  templateUrl: './seletor-passageiro.component.html',
  styleUrls: ['./seletor-passageiro.component.scss'],
  providers: [ // Relaciona os serviços que podem ser expostos pelo módulo/componente.
    {
      // NG_VALUE_ACCESSOR: Serviço de ControlValueAccessor para comunicação com o formulário.
      provide: NG_VALUE_ACCESSOR,
      // forwardRef: referencia um Componente declarado depois deste dicionário.
      // No caso, a referência é ao próprio SeletorPassageiroComponent, cujo conteúdo
      // ainda será explicitado.
      useExisting: forwardRef(() => SeletorPassageiroComponent),
      // multi: informa se o provider pode fornecer múltiplas diretivas.
      multi: true, // Sim, o componente é um multi-provider.
    }
  ]
})
export class SeletorPassageiroComponent implements ControlValueAccessor {
  @Input() titulo: string = 'Titulo'
  @Input() subtitulo: string = 'Subtitulo'

  value: number = 0

  onChange = (val: number) => {}
  onTouch = () => {}

  writeValue(val: any): void {
    this.value = val
  }
  registerOnChange(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onChange.
  }
  registerOnTouched(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onTouch.
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

  incrementar() {
    this.value++
    this.onChange(this.value)
    this.onTouch()
  }
  decrementar() {
    if(this.value > 0) {
      this.value--
      this.onChange(this.value)
      this.onTouch()
    }
  }
}
